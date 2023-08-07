#!/bin/bash
SCRIPT_DIR=$(cd $(dirname $0); pwd)
RUN_TEST_COMMAND="jest --config jest.config.js ${@}"
firebase emulators:exec --only firestore "$RUN_TEST_COMMAND"
