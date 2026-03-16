import { i } from "@instantdb/react";

const _schema = i.schema({
  entities: {
    users: i.entity({
      email: i.string().unique().indexed(),
      name: i.string().optional(),
      university: i.string().optional(),
    }),
    guides: i.entity({
      title: i.string(),
      body: i.string(),
      category: i.string(),
      university: i.string(),
      createdAt: i.number().indexed(),
    }),
    events: i.entity({
      title: i.string(),
      description: i.string(),
      university: i.string(),
      category: i.string(),
      eventDate: i.number().indexed(),
      createdAt: i.number().indexed(),
    }),
    comments: i.entity({
      body: i.string(),
      createdAt: i.number().indexed(),
    }),
    guideVotes: i.entity({
      voteType: i.string(), // "accurate" | "outdated"
    }),
    eventVotes: i.entity({
      status: i.string(), // "going" | "interested" | "not_going"
    }),
  },
  links: {
    guideAuthors: {
      forward: { on: "guides", has: "one", label: "author" },
      reverse: { on: "users", has: "many", label: "guides" },
    },
    eventAuthors: {
      forward: { on: "events", has: "one", label: "author" },
      reverse: { on: "users", has: "many", label: "events" },
    },
    guideComments: {
      forward: { on: "guides", has: "many", label: "comments" },
      reverse: { on: "comments", has: "one", label: "guide" },
    },
    commentAuthors: {
      forward: { on: "comments", has: "one", label: "author" },
      reverse: { on: "users", has: "many", label: "comments" },
    },
    guideVotesLink: {
      forward: { on: "guideVotes", has: "one", label: "guide" },
      reverse: { on: "guides", has: "many", label: "votes" },
    },
    guideVoteAuthors: {
      forward: { on: "guideVotes", has: "one", label: "author" },
      reverse: { on: "users", has: "many", label: "guideVotes" },
    },
    eventVotesLink: {
      forward: { on: "eventVotes", has: "one", label: "event" },
      reverse: { on: "events", has: "many", label: "votes" },
    },
    eventVoteAuthors: {
      forward: { on: "eventVotes", has: "one", label: "author" },
      reverse: { on: "users", has: "many", label: "eventVotes" },
    },
  },
});

type _AppSchema = typeof _schema;
export interface AppSchema extends _AppSchema {}

const schema: AppSchema = _schema;

export default schema;

