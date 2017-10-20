#!/usr/bin/env python
# coding=utf-8

import requests
import os
import sys

PROJECT_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
VERSION_INI_PATH = os.path.join(PROJECT_PATH, 'version.ini')
ACCESS_TOKEN = ''


def build_github_url(path, access_token=ACCESS_TOKEN, endpoint='api'):
    return 'https://%s.github.com%s?access_token=%s' % (endpoint, path, access_token)


def print_message(msg):
    print msg


def create_github_release(version, tag):
    url = build_github_url('/repos/AnyChart/AnyChart/releases')
    data = {
        'tag_name': tag,
        'target_commitish': tag,
        'name': 'Release %s' % tag,
        'body': """See version history at [AnyChart.com](http://www.anychart.com)
- [AnyChart version history](http://www.anychart.com/products/anychart/history?version=%s)
- [AnyStock version history](http://www.anychart.com/products/anystock/history?version=%s)
- [AnyGantt version history](http://www.anychart.com/products/anygantt/history?version=%s)
- [AnyMap version history](http://www.anychart.com/products/anymap/history?version=%s)""" %
                (version, version, version, version),
        'draft': True,
        'prerelease': False
    }

    r = requests.post(url, json=data)
    return r.json()


def upload_release_binary(release_json, name, path):
    print '    Uploading %s' % name
    f = open(path)
    content = f.read()
    f.close()

    path = '/repos/collaborativejs/collaborative-js/releases/%s/assets' % release_json['id']
    url = build_github_url(path, endpoint='uploads')
    url += '&name=%s' % name
    headers = {'Content-Type': 'application/javascript'}
    requests.post(url, data=content, headers=headers)


if __name__ == "__main__":
    global ACCESS_TOKEN
    ACCESS_TOKEN = sys.argv[1]
    version = os.environ.get('VERSION')
    tag_name = 'v%s' % version

    print 'Creating github release %s' % tag_name
    release = create_github_release(version, tag_name)

    print 'Uploading release files %s' % tag_name
    upload_release_binary(
        release,
        'anychart-installation-package-%s.zip' % version,
        os.path.join(PROJECT_PATH, 'dist', 'installation-package.zip')
    )

    print_message('Successfully release %s' % tag_name)