import pytest
from unittest.mock import MagicMock
from fastapi import status
from sqlalchemy.orm import Session
from app.models import User
from app.auth_utils import verify_password

def test_register_user_success(client, db_session, mock_send_email):
    user_data = {
        "email": "NewUser@example.com",
        "password": "securepassword",
        "name": "New User"
    }
    
    response = client.post("/api/auth/register", json=user_data)
    
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["email"] == "newuser@example.com"  # should be normalized/lowercased
    assert data["name"] == "New User"
    assert data["is_verified"] is False
    assert "id" in data
    
    # Check that database has user
    user = db_session.query(User).filter(User.email == "newuser@example.com").first()
    assert user is not None
    assert verify_password("securepassword", user.hashed_password)
    assert user.verification_token is not None
    
    # Check that email dispatch was triggered
    mock_send_email.assert_called_once_with(
        to_email="newuser@example.com",
        name="New User",
        token=user.verification_token
    )

def test_register_duplicate_email(client, test_user):
    user_data = {
        "email": test_user.email,
        "password": "anotherpassword",
        "name": "Duplicate User"
    }
    
    response = client.post("/api/auth/register", json=user_data)
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert response.json()["detail"] == "Email already registered"

def test_login_success(client, test_user):
    login_data = {
        "email": test_user.email,
        "password": "password123"
    }
    
    response = client.post("/api/auth/login", json=login_data)
    assert response.status_code == status.HTTP_200_OK
    
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == test_user.email
    
    # Verify cookie was set
    assert "access_token" in response.cookies
    cookie = response.cookies["access_token"]
    assert cookie == data["access_token"]

def test_login_invalid_credentials(client, test_user):
    login_data = {
        "email": test_user.email,
        "password": "wrongpassword"
    }
    
    response = client.post("/api/auth/login", json=login_data)
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert response.json()["detail"] == "Incorrect email or password"
    assert "access_token" not in response.cookies

def test_logout(auth_client):
    response = auth_client.post("/api/auth/logout")
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["message"] == "Logged out successfully"
    # Verify that the response sent a Set-Cookie header to clear the token
    cookie_header = response.headers.get("set-cookie")
    assert cookie_header is not None
    assert "access_token=" in cookie_header
    assert "Max-Age=0" in cookie_header or "max-age=0" in cookie_header or "expires=" in cookie_header

def test_get_me_authenticated(auth_client, test_user):
    response = auth_client.get("/api/auth/me")
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["email"] == test_user.email

def test_get_me_unauthenticated(client):
    response = client.get("/api/auth/me")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED

def test_confirm_email_success(client, db_session, mock_send_email):
    # Register user first to get token
    user_data = {
        "email": "verify@example.com",
        "password": "password123",
        "name": "Verify Me"
    }
    client.post("/api/auth/register", json=user_data)
    user = db_session.query(User).filter(User.email == "verify@example.com").first()
    token = user.verification_token
    assert token is not None
    assert user.is_verified is False
    
    # Confirm email
    response = client.get(f"/api/auth/confirm/{token}", follow_redirects=False)
    assert response.status_code == status.HTTP_307_TEMPORARY_REDIRECT
    assert "success=true" in response.headers["location"]
    
    db_session.refresh(user)
    assert user.is_verified is True
    assert user.verification_token is None

def test_confirm_email_invalid_token(client):
    response = client.get("/api/auth/confirm/nonexistenttoken", follow_redirects=False)
    assert response.status_code == status.HTTP_307_TEMPORARY_REDIRECT
    assert "success=false" in response.headers["location"]

def test_update_profile_name(auth_client, db_session, test_user):
    update_data = {
        "name": "Updated Name"
    }
    response = auth_client.put("/api/auth/profile", json=update_data)
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["name"] == "Updated Name"
    
    db_session.refresh(test_user)
    assert test_user.name == "Updated Name"

def test_update_profile_email(auth_client, db_session, test_user, mock_send_email):
    update_data = {
        "email": "newemail@example.com"
    }
    response = auth_client.put("/api/auth/profile", json=update_data)
    assert response.status_code == status.HTTP_200_OK
    
    db_session.refresh(test_user)
    # The current email shouldn't change yet, but pending_email should be set
    assert test_user.email == "testuser@example.com"
    assert test_user.pending_email == "newemail@example.com"
    assert test_user.verification_token is not None
    
    # Check that verification email was sent to new email
    mock_send_email.assert_called_once_with(
        to_email="newemail@example.com",
        name=test_user.name,
        token=test_user.verification_token
    )
