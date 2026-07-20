import pytest
from datetime import datetime, timedelta, timezone
from fastapi import status
from sqlalchemy.orm import Session
from app.models import Task, User
from app.auth_utils import hash_password

@pytest.fixture
def other_user(db_session):
    user = User(
        email="otheruser@example.com",
        hashed_password=hash_password("password123"),
        name="Other User",
        is_verified=True,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user

@pytest.fixture
def public_task(db_session):
    task = Task(
        title="Public Guest Task",
        description="Available to anyone",
        priority=3,
        user_id=None,
    )
    db_session.add(task)
    db_session.commit()
    db_session.refresh(task)
    return task

@pytest.fixture
def user_task(db_session, test_user):
    task = Task(
        title="Test User Private Task",
        description="Private to test_user",
        priority=8,
        user_id=test_user.id,
    )
    db_session.add(task)
    db_session.commit()
    db_session.refresh(task)
    return task

@pytest.fixture
def other_user_task(db_session, other_user):
    task = Task(
        title="Other User Private Task",
        description="Private to other_user",
        priority=5,
        user_id=other_user.id,
    )
    db_session.add(task)
    db_session.commit()
    db_session.refresh(task)
    return task


# --- READ TESTS ---

def test_list_tasks_guest(client, public_task, user_task):
    response = client.get("/tasks")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    
    # Guest should see public task, but not private task
    assert len(data) == 1
    assert data[0]["id"] == public_task.id
    assert data[0]["title"] == "Public Guest Task"

def test_list_tasks_authenticated(auth_client, public_task, user_task):
    response = auth_client.get("/tasks")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    
    # Authenticated user should see their private task, but not public task
    assert len(data) == 1
    assert data[0]["id"] == user_task.id
    assert data[0]["title"] == "Test User Private Task"

def test_get_task_guest_success(client, public_task):
    response = client.get(f"/tasks/{public_task.id}")
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["title"] == public_task.title

def test_get_task_private_owner_success(auth_client, user_task):
    response = auth_client.get(f"/tasks/{user_task.id}")
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["title"] == user_task.title

def test_get_task_forbidden_for_guest(client, user_task):
    response = client.get(f"/tasks/{user_task.id}")
    assert response.status_code == status.HTTP_403_FORBIDDEN
    assert response.json()["detail"] == "Not authorized to access this task"

def test_get_task_forbidden_for_other_user(auth_client, other_user_task):
    response = auth_client.get(f"/tasks/{other_user_task.id}")
    assert response.status_code == status.HTTP_403_FORBIDDEN
    assert response.json()["detail"] == "Not authorized to access this task"


# --- CREATE TESTS ---

def test_create_task_guest(client, db_session):
    task_data = {
        "title": "New Guest Task",
        "description": "Created by a guest",
        "priority": 4
    }
    response = client.post("/tasks", json=task_data)
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["title"] == "New Guest Task"
    
    # Check db
    task = db_session.get(Task, data["id"])
    assert task is not None
    assert task.user_id is None

def test_create_task_authenticated(auth_client, db_session, test_user):
    task_data = {
        "title": "New User Task",
        "description": "Created by logged in user",
        "priority": 9
    }
    response = auth_client.post("/tasks", json=task_data)
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["title"] == "New User Task"
    
    # Check db has assigned user_id
    task = db_session.get(Task, data["id"])
    assert task is not None
    assert task.user_id == test_user.id


# --- UPDATE TESTS ---

def test_update_task_success(auth_client, db_session, user_task):
    update_data = {
        "title": "Updated Private Task Title",
        "priority": 2
    }
    response = auth_client.patch(f"/tasks/{user_task.id}", json=update_data)
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["title"] == "Updated Private Task Title"
    
    db_session.refresh(user_task)
    assert user_task.title == "Updated Private Task Title"
    assert user_task.priority == 2

def test_update_task_completed_logic(auth_client, db_session, user_task):
    # Set to urgent first to test auto-clearing urgent status on complete
    user_task.is_urgent = True
    db_session.commit()
    
    update_data = {
        "is_done": True
    }
    response = auth_client.patch(f"/tasks/{user_task.id}", json=update_data)
    assert response.status_code == status.HTTP_200_OK
    
    data = response.json()
    assert data["is_done"] is True
    assert data["is_urgent"] is False
    assert data["completed_at"] is not None
    
    db_session.refresh(user_task)
    assert user_task.is_done is True
    assert user_task.is_urgent is False
    assert user_task.completed_at is not None

def test_update_task_forbidden(auth_client, other_user_task):
    update_data = {"title": "Attempt Hack"}
    response = auth_client.patch(f"/tasks/{other_user_task.id}", json=update_data)
    assert response.status_code == status.HTTP_403_FORBIDDEN


# --- DELETE TESTS ---

def test_delete_task_success(auth_client, db_session, user_task):
    response = auth_client.delete(f"/tasks/{user_task.id}")
    assert response.status_code == status.HTTP_204_NO_CONTENT
    
    # Check db
    task = db_session.get(Task, user_task.id)
    assert task is None

def test_delete_task_forbidden(auth_client, other_user_task):
    response = auth_client.delete(f"/tasks/{other_user_task.id}")
    assert response.status_code == status.HTTP_403_FORBIDDEN


# --- VALIDATION TESTS ---

def test_create_task_invalid_priority_low(client):
    task_data = {
        "title": "Low priority",
        "priority": 0
    }
    response = client.post("/tasks", json=task_data)
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT

def test_create_task_invalid_priority_high(client):
    task_data = {
        "title": "High priority",
        "priority": 11
    }
    response = client.post("/tasks", json=task_data)
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT

def test_create_task_invalid_deadline_past(client):
    past_time = (datetime.now(timezone.utc) - timedelta(hours=1)).isoformat()
    task_data = {
        "title": "Past task",
        "deadline": past_time
    }
    response = client.post("/tasks", json=task_data)
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT

def test_create_task_invalid_deadline_no_timezone(client):
    # Missing 'Z' or offset
    naive_future_time = (datetime.now() + timedelta(hours=5)).strftime("%Y-%m-%dT%H:%M:%S")
    task_data = {
        "title": "Naive deadline",
        "deadline": naive_future_time
    }
    response = client.post("/tasks", json=task_data)
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT


# --- STATS TEST ---

def test_get_task_stats(auth_client, db_session, test_user):
    # Clean up existing tasks to make stats predictable
    db_session.query(Task).filter(Task.user_id == test_user.id).delete()
    db_session.commit()
    
    # Add tasks with different states
    t1 = Task(title="T1", is_done=True, user_id=test_user.id)
    t2 = Task(title="T2", is_done=False, is_urgent=False, user_id=test_user.id)
    t3 = Task(title="T3", is_done=False, is_urgent=True, user_id=test_user.id)
    db_session.add_all([t1, t2, t3])
    db_session.commit()
    
    response = auth_client.get("/tasks/stats")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["total"] == 3
    assert data["done"] == 1
    assert data["undone"] == 2
    assert data["urgent"] == 1
