# Ignore vercel build if not production
# Reference: https://vercel.com/guides/how-do-i-use-the-ignored-build-step-field-on-vercel
if [ "$VERCEL_ENV" == "production" ]; then exit 1; else exit 0; fi
