import { relations } from 'drizzle-orm';
import { 
  invitations, 
  organizations, 
  members, 
  users, 
  teams, 
  teamMembers,
  assistants,
  assistantFiles
} from './schema';

export const organizationsRelations = relations(organizations, ({ many }) => ({
  members: many(members),
  invitations: many(invitations),
  teams: many(teams),
  assistants: many(assistants)
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
  assistants: many(assistants, { relationName: 'creator' })
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