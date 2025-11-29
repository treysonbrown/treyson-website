"""initial work log schema

Revision ID: 4d5e838df907
Revises: 
Create Date: 2025-11-28 06:54:01.646526

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel


# revision identifiers, used by Alembic.
revision: str = '4d5e838df907'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'user',
        sa.Column('id', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column('name', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.Column('email', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_table(
        'worklogentry',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('work_date', sa.Date(), nullable=False),
        sa.Column('minutes', sa.Integer(), nullable=False),
        sa.Column('description', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.Column('user_id', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['user.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_worklogentry_user_id'), 'worklogentry', ['user_id'], unique=False)
    op.create_index(op.f('ix_worklogentry_work_date'), 'worklogentry', ['work_date'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_worklogentry_work_date'), table_name='worklogentry')
    op.drop_index(op.f('ix_worklogentry_user_id'), table_name='worklogentry')
    op.drop_table('worklogentry')
    op.drop_table('user')
