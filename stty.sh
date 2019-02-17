#!/bin/bash
sudo stty -F /dev/ttyAMA0 1200 sane evenp parenb cs7 -crtscts
echo "--stty--"
