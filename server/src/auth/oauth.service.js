import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { OAuth2Client } from 'google-auth-library';
import { config } from '../config/configuration.js';
import { User } from '../users/users.model.js';

export const OAuthService = {
  // Initialize Google OAuth Strategy
  initializeGoogleStrategy: () => {
    if (!config.oauth?.google?.clientId || !config.oauth?.google?.clientSecret) {
      console.warn('⚠️ Google OAuth not configured - missing credentials');
      return;
    }

    passport.use(
      new GoogleStrategy(
        {
          clientID: config.oauth.google.clientId,
          clientSecret: config.oauth.google.clientSecret,
          callbackURL: config.oauth.google.callbackURL
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            // Extract user info from Google profile
            const { id: googleId, displayName, emails } = profile;
            const email = emails?.[0]?.value?.toLowerCase();

            if (!email) {
              return done(new Error('No email found in Google profile'));
            }

            console.log(`🔐 [OAuth] Google user: ${email} (${googleId})`);

            // Try to find existing user by email
            let user = await User.findOne({ email });

            if (user) {
              // User exists - link Google ID if not already linked
              if (!user.googleId) {
                console.log(`✅ [OAuth] Linking Google ID to existing user: ${email}`);
                user.googleId = googleId;
                user.provider = 'google';
                user.isEmailVerified = true; // OAuth emails are pre-verified
                await user.save();
              }
            } else {
              // Create new user from Google profile
              console.log(`✨ [OAuth] Creating new user from Google: ${email}`);
              user = await User.create({
                email,
                name: displayName || 'Google User',
                googleId,
                provider: 'google',
                passwordHash: 'oauth_' + googleId, // Placeholder for OAuth users
                isEmailVerified: true, // Google accounts are pre-verified
                role: 'customer' // Default role
              });
            }

            return done(null, user);
          } catch (error) {
            console.error('❌ [OAuth] Strategy error:', error.message);
            return done(error);
          }
        }
      )
    );

    // Serialize user for session
    passport.serializeUser((user, done) => {
      done(null, user.id);
    });

    // Deserialize user from session
    passport.deserializeUser(async (id, done) => {
      try {
        const user = await User.findById(id);
        done(null, user);
      } catch (error) {
        done(error);
      }
    });

    console.log('✅ [OAuth] Google OAuth strategy initialized');
  },

  // Find or create user from OAuth token
  findOrCreateGoogleUser: async (profile) => {
    try {
      const { id: googleId, displayName, emails } = profile;
      const email = emails?.[0]?.value?.toLowerCase();

      if (!email) {
        throw new Error('No email found in Google profile');
      }

      let user = await User.findOne({ email });

      if (!user) {
        user = await User.create({
          email,
          name: displayName || 'Google User',
          googleId,
          provider: 'google',
          passwordHash: 'oauth_' + googleId,
          isEmailVerified: true,
          role: 'customer'
        });
        console.log(`✨ [OAuth] New user created: ${email}`);
      } else if (!user.googleId) {
        user.googleId = googleId;
        user.provider = 'google';
        user.isEmailVerified = true;
        await user.save();
        console.log(`✅ [OAuth] Google ID linked to existing user: ${email}`);
      }

      return user;
    } catch (error) {
      console.error('❌ [OAuth] findOrCreateGoogleUser error:', error.message);
      throw error;
    }
  },

  // Verify Google credential token and find/create user
  verifyGoogleToken: async (token) => {
    try {
      const client = new OAuth2Client(config.oauth.google.clientId);
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: config.oauth.google.clientId
      });

      const payload = ticket.getPayload();
      const googleId = payload['sub'];
      const email = payload['email']?.toLowerCase();
      const displayName = payload['name'];

      if (!email) {
        throw new Error('No email in Google token');
      }

      console.log(`🔐 [OAuth] Verified Google token for: ${email}`);

      // Find or create user
      let user = await User.findOne({ email });

      if (!user) {
        user = await User.create({
          email,
          name: displayName || 'Google User',
          googleId,
          provider: 'google',
          passwordHash: 'oauth_' + googleId,
          isEmailVerified: true,
          role: 'customer'
        });
        console.log(`✨ [OAuth] New user created: ${email}`);
      } else if (!user.googleId) {
        user.googleId = googleId;
        user.provider = 'google';
        user.isEmailVerified = true;
        await user.save();
        console.log(`✅ [OAuth] Google ID linked to existing user: ${email}`);
      }

      return user;
    } catch (error) {
      console.error('❌ [OAuth] verifyGoogleToken error:', error.message);
      throw new Error('Invalid Google token: ' + error.message);
    }
  }
};

// Initialize Google strategy when module is imported
OAuthService.initializeGoogleStrategy();
