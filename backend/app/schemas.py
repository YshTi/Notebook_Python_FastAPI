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