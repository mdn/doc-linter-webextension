# Beta Testing

## How to install a beta testing release
Beta testing release are not submitted to AMO (addons.mozilla.org) and
consequently are unsigned extensions.

The next steps will explain how to install an unsigned extension and more specifically mdn-doc-linter.

## Pre-requisites
- Firefox Nightly 55 or bigger

## Step 1 : Disable Nightly signature checking
Note: This step allow you to install any unsigned extension which
are non-verified by Mozilla and therefore might be unsafe.

- Go to `about:config`
- Accept the Warning
- Change `xpinstall.signatures.required` value to `false`

## Step 2 : Download the release
Go to https://github.com/mdn/doc-linter-webextension/releases and download the last release of the webextension

## Step 3 : Install the mdn-doc-linter extension
On your Nightly installation  
- Go to `about:addons`
- On the sidebar of the page click on `Extensions`
- On the upper corner click on the :fa-cog: and then on `Install module from a file`
- Accept the permissions, he prompt you to accept.