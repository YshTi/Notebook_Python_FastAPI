from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy import asc, desc, or_, select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Task
from app.schemas import TaskCreate, TaskResponse, TaskUpdate


router = APIRouter(
    prefix="/tasks",
    tags=["Tasks"],
)


@router.get("", response_model=list[TaskResponse])
def list_tasks(
    search: str | None = Query(default=None, max_length=200),
    task_status: Literal["all", "done", "undone"] = Query(
        default="all",
        alias="status",
    ),
    sort: Literal["priority_asc", "priority_desc"] | None = None,
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
        statement = statement.where(Task.is_done.is_(True))
    elif task_status == "undone":
        statement = statement.where(Task.is_done.is_(False))

    if sort == "priority_asc":
        statement = statement.order_by(
            asc(Task.priority),
            desc(Task.created_at),
        )
    elif sort == "priority_desc":
        statement = statement.order_by(
            desc(Task.priority),
            desc(Task.created_at),
        )
    else:
        statement = statement.order_by(desc(Task.created_at))

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
    task = Task(**task_data.model_dump())

    db.add(task)
    db.commit()
    db.refresh(task)

    return task


@router.get("/{task_id}", response_model=TaskResponse)
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


@router.patch("/{task_id}", response_model=TaskResponse)
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

    update_data = task_data.model_dump(exclude_unset=True)

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

    return Response(status_code=status.HTTP_204_NO_CONTENT)