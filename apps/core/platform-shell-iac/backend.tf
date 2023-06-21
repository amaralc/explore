# This block sets up what backend should be used for Terraform. In this case, we are using Google Cloud Storage.
terraform {
  backend "gcs" {                                  # The Google Cloud Storage backend
    bucket      = "peerlab-platform-shell-tfstate" # The name of the bucket to store the state file
    credentials = "credentials.json"               # The path to the JSON key file for the Service Account Terraform will use to manage its state
    prefix      = "experimental"                   # The path to the state file within the bucket
  }
}


# Stability levels explained
# Here's a quick guide to these stability levels and their meaning:

# Experimental means "try it only in toy projects":

# We are just trying out an idea and want some users to play with it and give feedback. If it doesn't work out, we may drop it any minute.

# Alpha means "use at your own risk, expect migration issues":

# We decided to productize this idea, but it hasn't reached the final shape yet.

# Beta means "you can use it, we'll do our best to minimize migration issues for you":

# It's almost done, user feedback is especially important now.

# Still, it's not 100% finished, so changes are possible (including ones based on your own feedback).

# Watch for deprecation warnings in advance for the best update experience.

# We collectively refer to Experimental, Alpha and Beta as pre-stable levels.

# Stable means "use it even in most conservative scenarios":

# It's done. We will be evolving it according to our strict backward compatibility rules.

# Please note that stability levels do not say anything about how soon a component will be released as Stable. Similarly, they do not indicate how much a component will be changed before release. They only say how fast a component is changing and how much risk of update issues users are running.
