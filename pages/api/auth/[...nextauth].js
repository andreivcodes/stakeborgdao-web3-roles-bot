import NextAuth from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import dotenv from "dotenv";

dotenv.config();

export default NextAuth({
  providers: [
    DiscordProvider({
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      authorization: { params: { scope: "identify" } },
      profile: (profile) => {
        let userAvatar = `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`;
        return {
          id: profile.id,
          uid: profile.uid,
          email: profile.email,
          name: profile.username,
          image: userAvatar,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile, email, credentials, session }) {
      return true;
    },
    session: async (session, user) => {
      return Promise.resolve(session);
    },
  },
  theme: {
    colorScheme: "light",
  },
});
