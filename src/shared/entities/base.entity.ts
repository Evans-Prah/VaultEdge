import {
    CreateDateColumn,
    DeleteDateColumn,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
    VersionColumn
} from "typeorm";

/**
 * BaseEntity defines common columns for all entities:
 * - id: UUID primary key
 * - created_at: record creation timestamp
 * - updated_at: record update timestamp
 * - deleted_at: soft-delete timestamp
 * - version: optimistic lock version
 */
export abstract class BaseEntity {
    @PrimaryGeneratedColumn('uuid', { name: 'id' })
    id!: string;

    @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
    updatedAt!: Date;

    @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp with time zone', nullable: true })
    deletedAt?: Date;

    @VersionColumn({ name: 'version' })
    version!: number;
}