#!/bin/bash
zip -r trello-hooks.zip * --quiet
mkdir -p dpl_cd_upload
mv trello-hooks.zip dpl_cd_upload/trello-hooks.zip
