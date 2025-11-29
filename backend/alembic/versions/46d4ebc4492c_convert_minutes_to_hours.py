"""convert_minutes_to_hours

Revision ID: 46d4ebc4492c
Revises: 4d5e838df907
Create Date: 2025-11-28 07:31:58.185167

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '46d4ebc4492c'
down_revision: Union[str, None] = '4d5e838df907'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "worklogentry",
        sa.Column("hours", sa.Numeric(precision=6, scale=2), nullable=True),
    )
    op.execute("UPDATE worklogentry SET hours = minutes / 60.0")
    op.alter_column("worklogentry", "hours", nullable=False)
    op.drop_column("worklogentry", "minutes")


def downgrade() -> None:
    op.add_column(
        "worklogentry",
        sa.Column("minutes", sa.Integer(), nullable=True),
    )
    op.execute("UPDATE worklogentry SET minutes = ROUND(COALESCE(hours, 0) * 60)")
    op.alter_column("worklogentry", "minutes", nullable=False)
    op.drop_column("worklogentry", "hours")
