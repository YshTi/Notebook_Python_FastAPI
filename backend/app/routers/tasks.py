from datetime import datetime, timezone
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy import asc, desc, or_, select, func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Task
from app.schemas import TaskCreate, TaskResponse, TaskUpdate, TaskStatsResponse


router = APIRouter(
    prefix="/tasks",
    tags=["Tasks"],
)


@router.get("", response_model=list[TaskResponse])
def list_tasks(
    search: str | None = Query(default=None, max_length=200),
    task_status: Literal[
        "all",
        "done",
        "undone",
        "urgent",
    ] = Query(
        default="all",
        alias="status",
    ),
    sort: Literal[
        "created_desc",
        "created_asc",
        "priority_asc",
        "priority_desc",
        "deadline_asc",
        "deadline_desc",
    ] = Query(default="created_desc"),
    db: Session = Depends(get_db),
) -> list[Task]:
    statement = select(Task)

    if search and search.strip():
        pattern = f"%{search.strip()}%"

        statement = statement.where(
            or_(
                Task.title.ilike(pattern),
                Task.description.ilike(pattern),
            )
        )

    if task_status == "done":
        statement = statement.where(
            Task.is_done.is_(True)
        )

    elif task_status == "undone":
        statement = statement.where(
            Task.is_done.is_(False)
        )

    elif task_status == "urgent":
        statement = statement.where(
            Task.is_urgent.is_(True),
            Task.is_done.is_(False),
        )

    sort_options = {
        "created_desc": (
            asc(Task.is_done),
            desc(Task.created_at),
        ),
        "created_asc": (
            asc(Task.is_done),
            asc(Task.created_at),
        ),
        "priority_asc": (
            asc(Task.is_done),
            asc(Task.priority),
            desc(Task.created_at),
        ),
        "priority_desc": (
            asc(Task.is_done),
            desc(Task.priority),
            desc(Task.created_at),
        ),
        "deadline_asc": (
            asc(Task.is_done),
            Task.deadline.asc().nulls_last(),
            desc(Task.created_at),
        ),
        "deadline_desc": (
            asc(Task.is_done),
            Task.deadline.desc().nulls_last(),
            desc(Task.created_at),
        ),
    }

    statement = statement.order_by(
        *sort_options[sort]
    )

    return list(db.scalars(statement).all())


@router.post(
    "",
    response_model=TaskResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_task(
    task_data: TaskCreate,
    db: Session = Depends(get_db),
) -> Task:
    task = Task(
        **task_data.model_dump()
    )

    db.add(task)
    db.commit()
    db.refresh(task)

    return task


@router.get("/stats", response_model=TaskStatsResponse)
def get_task_stats(db: Session = Depends(get_db)) -> TaskStatsResponse:
    total = db.scalar(select(func.count(Task.id)))
    done = db.scalar(select(func.count(Task.id)).where(Task.is_done.is_(True)))
    undone = db.scalar(select(func.count(Task.id)).where(Task.is_done.is_(False)))
    urgent = db.scalar(select(func.count(Task.id)).where(Task.is_urgent.is_(True), Task.is_done.is_(False)))

    return TaskStatsResponse(
        total=total or 0,
        done=done or 0,
        undone=undone or 0,
        urgent=urgent or 0,
    )


@router.get(
    "/{task_id}",
    response_model=TaskResponse,
)
def get_task(
    task_id: int,
    db: Session = Depends(get_db),
) -> Task:
    task = db.get(Task, task_id)

    if task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )

    return task


@router.patch(
    "/{task_id}",
    response_model=TaskResponse,
)
def update_task(
    task_id: int,
    task_data: TaskUpdate,
    db: Session = Depends(get_db),
) -> Task:
    task = db.get(Task, task_id)

    if task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )

    update_data = task_data.model_dump(
        exclude_unset=True
    )

    if "is_done" in update_data:
        new_is_done = update_data["is_done"]

        if new_is_done is True and task.is_done is False:
            task.completed_at = datetime.now(
                timezone.utc
            )

            # A completed task should no longer be urgent.
            update_data["is_urgent"] = False

        elif new_is_done is False and task.is_done is True:
            task.completed_at = None

    for field_name, value in update_data.items():
        setattr(task, field_name, value)

    db.commit()
    db.refresh(task)

    return task


@router.delete(
    "/{task_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
) -> Response:
    task = db.get(Task, task_id)

    if task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )

    db.delete(task)
    db.commit()

    return Response(
        status_code=status.HTTP_204_NO_CONTENT
    )