- (fly) Error: found 1 machines that are unmanaged.

```
Error: local-exec provisioner error
│
│   with null_resource.set_fly_secrets,
│   on main.tf line 39, in resource "null_resource" "set_fly_secrets":
│   39:   provisioner "local-exec" {
│
│ Error running command '      echo "Settings fly secrets..." &&
│       cd ../service-rest-api/ &&
│       fly secrets set DATABASE_URL=value && fly secrets set DIRECT_URL=value
│ ': exit status 1. Output: Settings fly secrets...
│ INFO Using wait timeout: 2m0s lease timeout: 13s delay between lease refreshes: 4s
│ Error: found 1 machines that are unmanaged. `fly deploy` only updates machines with fly_platform_version=v2 in their metadata. Use `fly machine list`
│ to list machines and `fly machine update --metadata fly_platform_version=v2 <machine id>` to update individual machines with the metadata. Once done,
│ `fly deploy` will update machines with the metadata based on your fly.toml app configuration
```

- (fly)

```
Error: found 2 machines that are unmanaged. `fly deploy` only updates machines with fly_platform_version=v2 in their metadata. Use `fly machine list` to list machines and `fly machine update --metadata fly_platform_version=v2 <machine id>` to update individual machines with the metadata. Once done, `fly deploy` will update machines with the metadata based on your fly.toml app configuration
```
