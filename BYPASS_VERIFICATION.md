# Using Vercel Protection Bypass for Verification

## How to Use the Bypass Token

Once you enable "Automation services" in Vercel, you'll get a bypass token. You can use it in two ways:

### Method 1: HTTP Header
```bash
curl -H "x-vercel-protection-bypass: YOUR_BYPASS_TOKEN" \
  https://gokartpartpicker-opg65kfky-dillons-projects-48dc60f7.vercel.app/api/engines
```

### Method 2: Query Parameter
```bash
curl "https://gokartpartpicker-opg65kfky-dillons-projects-48dc60f7.vercel.app/api/engines?x-vercel-protection-bypass=YOUR_BYPASS_TOKEN"
```

## Getting the Bypass Token

The bypass token is automatically available as the environment variable `VERCEL_AUTOMATION_BYPASS_SECRET` in your Vercel project.

To view it:
1. Go to: https://vercel.com/dillons-projects-48dc60f7/gokartpartpicker.com/settings/environment-variables
2. Look for `VERCEL_AUTOMATION_BYPASS_SECRET`
3. Copy the value

Or you can see it in the Vercel dashboard when you enable automation services.

## Testing with Bypass Token

Once you have the token, I can help verify your deployment is working correctly by using it to test all endpoints.

## Note

The bypass token is only needed for automated testing. Regular users accessing your site through a browser won't need it (unless password protection is enabled for them too).


