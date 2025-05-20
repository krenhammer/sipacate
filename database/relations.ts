import { relations } from 'drizzle-orm';
import { 
  invitations, 
  organizations, 
  members, 
  users, 
  teams, 
  teamMembers,
  assistants,
  assistantFiles,
  planTemplates,
  planSteps,
  planItems,
  planStepItems
} from './schema';

export const organizationsRelations = relations(organizations, ({ many }) => ({
  members: many(members),
  invitations: many(invitations),
  teams: many(teams),
  assistants: many(assistants),
  planTemplates: many(planTemplates),
  planSteps: many(planSteps),
  planItems: many(planItems)
}));

export const invitationsRelations = relations(invitations, ({ one }) => ({
  organization: one(organizations, {
    fields: [invitations.organizationId],
    references: [organizations.id]
  }),
  inviter: one(users, {
    fields: [invitations.inviterId],
    references: [users.id]
  })
}));

export const membersRelations = relations(members, ({ one, many }) => ({
  user: one(users, {
    fields: [members.userId],
    references: [users.id]
  }),
  organization: one(organizations, {
    fields: [members.organizationId],
    references: [organizations.id]
  }),
  teamMembers: many(teamMembers)
}));

export const teamsRelations = relations(teams, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [teams.organizationId],
    references: [organizations.id]
  }),
  teamMembers: many(teamMembers)
}));

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
  team: one(teams, {
    fields: [teamMembers.teamId],
    references: [teams.id]
  }),
  member: one(members, {
    fields: [teamMembers.memberId],
    references: [members.id]
  })
}));

export const usersRelations = relations(users, ({ many }) => ({
  members: many(members),
  invitations: many(invitations, { relationName: 'inviter' }),
  assistants: many(assistants, { relationName: 'creator' }),
  planTemplates: many(planTemplates),
  planSteps: many(planSteps),
  planItems: many(planItems)
}));

// Assistant relations
export const assistantsRelations = relations(assistants, ({ one, many }) => ({
  creator: one(users, {
    fields: [assistants.createdById],
    references: [users.id],
    relationName: 'creator'
  }),
  organization: one(organizations, {
    fields: [assistants.organizationId],
    references: [organizations.id]
  }),
  files: many(assistantFiles)
}));

export const assistantFilesRelations = relations(assistantFiles, ({ one }) => ({
  assistant: one(assistants, {
    fields: [assistantFiles.assistantId],
    references: [assistants.id]
  })
}));

// Plan Template Relations
export const planTemplatesRelations = relations(planTemplates, ({ one, many }) => ({
  creator: one(users, {
    fields: [planTemplates.createdById],
    references: [users.id]
  }),
  organization: one(organizations, {
    fields: [planTemplates.organizationId],
    references: [organizations.id]
  }),
  steps: many(planSteps)
}));

export const planStepsRelations = relations(planSteps, ({ one, many }) => ({
  planTemplate: one(planTemplates, {
    fields: [planSteps.planTemplateId],
    references: [planTemplates.id]
  }),
  creator: one(users, {
    fields: [planSteps.createdById],
    references: [users.id]
  }),
  organization: one(organizations, {
    fields: [planSteps.organizationId],
    references: [organizations.id]
  }),
  planStepItems: many(planStepItems)
}));

export const planItemsRelations = relations(planItems, ({ one, many }) => ({
  creator: one(users, {
    fields: [planItems.createdById],
    references: [users.id]
  }),
  organization: one(organizations, {
    fields: [planItems.organizationId],
    references: [organizations.id]
  }),
  planStepItems: many(planStepItems)
}));

export const planStepItemsRelations = relations(planStepItems, ({ one }) => ({
  planStep: one(planSteps, {
    fields: [planStepItems.planStepId],
    references: [planSteps.id]
  }),
  planItem: one(planItems, {
    fields: [planStepItems.planItemId],
    references: [planItems.id]
  })
})); 