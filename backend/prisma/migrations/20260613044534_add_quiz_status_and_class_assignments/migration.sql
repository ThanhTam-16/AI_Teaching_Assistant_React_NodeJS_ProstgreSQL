-- AlterTable
ALTER TABLE "quizzes" ADD COLUMN     "classId" TEXT,
ADD COLUMN     "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT';

-- AddForeignKey
ALTER TABLE "quizzes" ADD CONSTRAINT "quizzes_classId_fkey" FOREIGN KEY ("classId") REFERENCES "classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
