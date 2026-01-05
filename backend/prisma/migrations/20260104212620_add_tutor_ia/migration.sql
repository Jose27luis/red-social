-- CreateTable
CREATE TABLE "tutor_conversations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tutor_conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tutor_messages" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tutor_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tutor_action_logs" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "functionName" TEXT NOT NULL,
    "parameters" TEXT NOT NULL,
    "result" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tutor_action_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "tutor_conversations_userId_idx" ON "tutor_conversations"("userId");

-- CreateIndex
CREATE INDEX "tutor_conversations_createdAt_idx" ON "tutor_conversations"("createdAt");

-- CreateIndex
CREATE INDEX "tutor_messages_conversationId_idx" ON "tutor_messages"("conversationId");

-- CreateIndex
CREATE INDEX "tutor_messages_createdAt_idx" ON "tutor_messages"("createdAt");

-- CreateIndex
CREATE INDEX "tutor_action_logs_conversationId_idx" ON "tutor_action_logs"("conversationId");

-- CreateIndex
CREATE INDEX "tutor_action_logs_functionName_idx" ON "tutor_action_logs"("functionName");

-- AddForeignKey
ALTER TABLE "tutor_conversations" ADD CONSTRAINT "tutor_conversations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tutor_messages" ADD CONSTRAINT "tutor_messages_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "tutor_conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tutor_action_logs" ADD CONSTRAINT "tutor_action_logs_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "tutor_conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
