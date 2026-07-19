from datetime import datetime, timezone

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    field_validator,
    model_validator,
)


class TaskCreate(BaseModel):
    title: str = Field(
        min_length=1,
        max_length=200,
    )
    description: str | None = Field(
        default=None,
        max_length=5000,
    )
    priority: int = Field(
        default=5,
        ge=1,
        le=10,
    )
    is_urgent: bool = False
    deadline: datetime | None = None

    @field_validator("title")
    @classmethod
    def validate_title(cls, value: str) -> str:
        normalized_title = value.strip()

        if not normalized_title:
            raise ValueError("Title must not be blank")

        return normalized_title

    @field_validator("description")
    @classmethod
    def normalize_description(
        cls,
        value: str | None,
    ) -> str | None:
        if value is None:
            return None

        normalized_description = value.strip()

        return normalized_description or None

    @field_validator("deadline")
    @classmethod
    def validate_deadline(
        cls,
        value: datetime | None,
    ) -> datetime | None:
        if value is None:
            return None

        if value.tzinfo is None:
            raise ValueError(
                "Deadline must include timezone information"
            )

        if value <= datetime.now(timezone.utc):
            raise ValueError(
                "Deadline must be in the future"
            )

        return value


class TaskUpdate(BaseModel):
    title: str | None = Field(
        default=None,
        min_length=1,
        max_length=200,
    )
    description: str | None = Field(
        default=None,
        max_length=5000,
    )
    is_done: bool | None = None
    priority: int | None = Field(
        default=None,
        ge=1,
        le=10,
    )
    is_urgent: bool | None = None
    deadline: datetime | None = None

    @field_validator("title")
    @classmethod
    def validate_title(
        cls,
        value: str | None,
    ) -> str | None:
        if value is None:
            return None

        normalized_title = value.strip()

        if not normalized_title:
            raise ValueError("Title must not be blank")

        return normalized_title

    @field_validator("description")
    @classmethod
    def normalize_description(
        cls,
        value: str | None,
    ) -> str | None:
        if value is None:
            return None

        normalized_description = value.strip()

        return normalized_description or None

    @model_validator(mode="after")
    def validate_deadline(self) -> "TaskUpdate":
        if self.deadline is None:
            return self

        if self.deadline.tzinfo is None:
            raise ValueError(
                "Deadline must include timezone information"
            )

        if self.deadline <= datetime.now(timezone.utc):
            raise ValueError(
                "Deadline must be in the future"
            )

        return self


class TaskResponse(BaseModel):
    id: int
    title: str
    description: str | None
    is_done: bool
    priority: int
    is_urgent: bool
    completed_at: datetime | None
    deadline: datetime | None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TaskStatsResponse(BaseModel):
    total: int
    done: int
    undone: int
    urgent: int


class UserRegister(BaseModel):
    email: str = Field(min_length=3, max_length=255)
    password: str = Field(min_length=6, max_length=100)
    name: str | None = Field(default=None, max_length=100)

    @field_validator("email")
    @classmethod
    def validate_email(cls, value: str) -> str:
        normalized = value.strip().lower()
        if "@" not in normalized:
            raise ValueError("Invalid email format")
        return normalized


class UserLogin(BaseModel):
    email: str
    password: str


class UserResponse(BaseModel):
    id: int
    email: str
    name: str | None
    is_verified: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UserUpdate(BaseModel):
    email: str | None = Field(default=None, max_length=255)
    name: str | None = Field(default=None, max_length=100)
    password: str | None = Field(default=None, min_length=6, max_length=100)

    @field_validator("email")
    @classmethod
    def validate_email(cls, value: str | None) -> str | None:
        if value is None:
            return None
        normalized = value.strip().lower()
        if not normalized:
            return None
        if "@" not in normalized:
            raise ValueError("Invalid email format")
        return normalized


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse