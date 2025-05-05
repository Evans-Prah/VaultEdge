import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1746371117226 implements MigrationInterface {
    name = 'InitialMigration1746371117226'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."accounts_type_enum" AS ENUM('checking', 'savings', 'investment', 'loan')`);
        await queryRunner.query(`CREATE TYPE "public"."accounts_status_enum" AS ENUM('active', 'inactive', 'frozen', 'closed')`);
        await queryRunner.query(`CREATE TABLE "accounts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "version" integer NOT NULL, "user_id" uuid NOT NULL, "account_number" character varying NOT NULL, "type" "public"."accounts_type_enum" NOT NULL, "status" "public"."accounts_status_enum" NOT NULL DEFAULT 'active', "balance" numeric(18,2) NOT NULL DEFAULT '0', "currency" character varying(10) NOT NULL, CONSTRAINT "PK_5a7a02c20412299d198e097a8fe" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_3000dad1da61b29953f0747632" ON "accounts" ("user_id") `);
        await queryRunner.query(`CREATE TYPE "public"."users_kyc_status_enum" AS ENUM('NOT_STARTED', 'IN_PROGRESS', 'VERIFIED', 'REJECTED')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "version" integer NOT NULL, "email" character varying(255) NOT NULL, "password_hash" character varying(255) NOT NULL, "first_name" character varying(255) NOT NULL, "other_names" character varying(255), "last_name" character varying(255) NOT NULL, "phone_number" character varying(20), "date_of_birth" date, "email_verified" boolean NOT NULL DEFAULT false, "phone_verified" boolean NOT NULL DEFAULT false, "address" json, "kyc_status" "public"."users_kyc_status_enum" NOT NULL DEFAULT 'NOT_STARTED', "kyc_document" jsonb, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."wallets_status_enum" AS ENUM('active', 'inactive', 'frozen')`);
        await queryRunner.query(`CREATE TYPE "public"."wallets_type_enum" AS ENUM('standard', 'escrow', 'margin')`);
        await queryRunner.query(`CREATE TABLE "wallets" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "version" integer NOT NULL, "user_id" uuid NOT NULL, "balance" numeric(18,2) NOT NULL DEFAULT '0', "currency" character varying(10) NOT NULL, "status" "public"."wallets_status_enum" NOT NULL DEFAULT 'active', "type" "public"."wallets_type_enum" NOT NULL DEFAULT 'standard', CONSTRAINT "CHK_1c1bf32c2aa1b0f104543f3d6a" CHECK ("balance" >= 0), CONSTRAINT "PK_8402e5df5a30a229380e83e4f7e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_92558c08091598f7a4439586cd" ON "wallets" ("user_id") `);
        await queryRunner.query(`ALTER TABLE "accounts" ADD CONSTRAINT "FK_3000dad1da61b29953f07476324" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "wallets" ADD CONSTRAINT "FK_92558c08091598f7a4439586cda" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "wallets" DROP CONSTRAINT "FK_92558c08091598f7a4439586cda"`);
        await queryRunner.query(`ALTER TABLE "accounts" DROP CONSTRAINT "FK_3000dad1da61b29953f07476324"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_92558c08091598f7a4439586cd"`);
        await queryRunner.query(`DROP TABLE "wallets"`);
        await queryRunner.query(`DROP TYPE "public"."wallets_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."wallets_status_enum"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_kyc_status_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_3000dad1da61b29953f0747632"`);
        await queryRunner.query(`DROP TABLE "accounts"`);
        await queryRunner.query(`DROP TYPE "public"."accounts_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."accounts_type_enum"`);
    }

}
