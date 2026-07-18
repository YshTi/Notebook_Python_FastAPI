"""replace archive with task deadline

Revision ID: c56860c3949b
Revises: 93f423159ff4
Create Date: 2026-07-18 00:49:44.564678
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = "c56860c3949b"
down_revision: Union[str, Sequence[str], None] = "93f423159ff4"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    op.add_column(
        "tasks",
        sa.Column(
            "deadline",
            sa.DateTime(timezone=True),
            nullable=True,
        ),
    )

    op.create_index(
        op.f("ix_tasks_deadline"),
        "tasks",
        ["deadline"],
        unique=False,
    )

    op.create_index(
        op.f("ix_tasks_is_done"),
        "tasks",
        ["is_done"],
        unique=False,
    )

    op.create_index(
        op.f("ix_tasks_priority"),
        "tasks",
        ["priority"],
        unique=False,
    )

    op.drop_constraint(
        "check_archived_task_is_done",
        "tasks",
        type_="check",
    )

    op.drop_index(
        op.f("ix_tasks_archived_at"),
        table_name="tasks",
    )

    op.drop_column(
        "tasks",
        "archived_at",
    )


def downgrade() -> None:
    """Downgrade schema."""

    op.add_column(
        "tasks",
        sa.Column(
            "archived_at",
            postgresql.TIMESTAMP(timezone=True),
            autoincrement=False,
            nullable=True,
        ),
    )

    op.create_index(
        op.f("ix_tasks_archived_at"),
        "tasks",
        ["archived_at"],
        unique=False,
    )

    op.create_check_constraint(
        "check_archived_task_is_done",
        "tasks",
        "archived_at IS NULL OR is_done = true",
    )

    op.drop_index(
        op.f("ix_tasks_priority"),
        table_name="tasks",
    )

    op.drop_index(
        op.f("ix_tasks_is_done"),
        table_name="tasks",
    )

    op.drop_index(
        op.f("ix_tasks_deadline"),
        table_name="tasks",
    )

    op.drop_column(
        "tasks",
        "deadline",
    )