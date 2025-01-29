const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID, // Google Client ID
            clientSecret: process.env.GOOGLE_CLIENT_SECRET, // Google Client Secret
            callbackURL: "http://localhost:5000/auth/google/callback", // Geri dönüş URL'si
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                // Kullanıcı bilgilerini al
                const user = {
                    googleId: profile.id,
                    name: profile.displayName,
                    email: profile.emails[0].value,
                    avatar: profile.photos[0].value,
                };

                // Kullanıcı için JWT token oluştur
                const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '1h' });
                user.token = token;

                return done(null, user); // Kullanıcıyı döndür
            } catch (error) {
                return done(error, null); // Hata durumunda null döndür
            }
        }
    )
);

passport.serializeUser((user, done) => {
    done(null, user.googleId); // Sadece Google ID'yi saklayalım
});

passport.deserializeUser((id, done) => {
    // Burada kullanıcıyı DB'den çekebilirsiniz; şimdilik mock bir kullanıcı döndürelim
    const mockUser = {
        googleId: id,
        name: 'Mock User',
        email: 'mockuser@gmail.com',
        avatar: 'https://path-to-avatar.jpg',
    };
    done(null, mockUser); // Kullanıcıyı `req.user` içine ekler
});
