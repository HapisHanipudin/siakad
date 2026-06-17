CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"nama" text NOT NULL,
	"email" text NOT NULL,
	"role" text DEFAULT 'mahasiswa' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
