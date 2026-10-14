# Original asset access

Checked on 7 October 2026.

## Dropbox: confirmed

Connected as Daniel Oyegade, `daniel@bigpeoplemusic.co.uk`.
The shared folder `/SMW Media Files` is readable. Its tool-ready root is
`ns:12756079905//`.

Useful folders include `Archive Highlights`, `CONTACT images`, `SMW Films`,
`Liberation`, `October 2025 Events`, and `Heritage trail`.

Sample verified through Dropbox metadata:
`/SMW Media Files/Archive Highlights/2023 - Documentary/Photos/See My World BW (Akwa Ibom + Femi Israel)-69.jpg`.
The JPEG is 13,842,940 bytes and marked downloadable. Other documentary JPEGs
in the search results are around 11–16 MB. Pixel dimensions and whether each
file is a camera original still need checking when selecting assets.

## Samsung drive: confirmed

Both `/Volumes/T7` and `/Volumes/T7 Shield` are mounted and readable.
The See My World archive is on **T7 Shield**:

- `/Volumes/T7 Shield/SEE MY WORLD ARCHIVE` contains source media grouped by project and year.
- `/Volumes/T7 Shield/SEE_MY_WORLD_ARCHIVE` contains the proposed structured archive folders.

Read file bytes successfully from `DSC02225.JPG`, `DSC02226.JPG`, and
`DSC02227.JPG` under the `Manchester Palestine walk ` folder in the first
archive. Their sizes are approximately 9–11 MB. Keep the drive connected for
future asset retrieval. This check did not change source files.

## Cloudflare: confirmed for Big People Music R2

The browser now shows `Daniel@bigpeoplemusic.co.uk's Account`, account ID
`734a77bfee3b5ae4dd42bc84a57d023d`.
The correct R2 bucket is `see-my-world-archive`; the dashboard reports 93.19 GB
and public access disabled.

The existing rclone remote `see-my-world-r2` successfully lists the bucket and
its `SEE_MY_WORLD_ARCHIVE/` and `smw-2025/` prefixes. It also lists photographs
under `smw-2025/portico-library-supper-club/photos/`.
Read the first 32 bytes of `01.jpg` successfully and confirmed its JPEG signature.
The initial account-wide bucket-list request returned HTTP 403, but direct
access to the known bucket succeeds. New credentials are not currently needed
for this asset workflow.

Use the existing connection with the bucket explicitly:

```sh
rclone lsf see-my-world-r2:see-my-world-archive --max-depth 1
```

The default Wrangler OAuth login still belongs to the photo Gmail account;
do not use that default profile for Big People Music operations. R2 asset
retrieval uses the separate, verified rclone connection.

Cloudflare displayed a $1.61 overdue balance notice. The bucket remains
readable in this check; billing was not changed.

For the next site iteration, match existing site images to Dropbox or drive
sources, check dimensions and visual quality, and make web-sized derivatives
from the best source while retaining its source path. The current website
copies remain documented in `ASSET_SOURCES.md`.
