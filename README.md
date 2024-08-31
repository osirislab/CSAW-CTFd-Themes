# CSAW Themes

CTFd themes for the CSAW CTF.

## Subtree Installation

### Add repo to themes folder

```
git subtree add --prefix CTFd/themes/core-beta git@github.com:CTFd/core-beta.git main --squash
```

### Pull latest changes to subtree
```
git subtree pull --prefix CTFd/themes/core-beta git@github.com:CTFd/core-beta.git main --squash
```

### Subtree Gotcha

Make sure to use Merge Commits when dealing with the subtree here. For some reason Github's squash and commit uses the wrong line ending which causes issues with the subtree script: https://stackoverflow.com/a/47190256. 

## Todo

- Document how we are using Vite
- Create a cookie cutter template package to use with Vite

## Index.html

You will need to use a plugin that allows index.html to be rendered as a template by flask, instead of a page in the CTFd config. For example in a plugin's `__init__.py`:

```python
from flask import render_template

def load(app):
    @app.route("/")
    def csaw_index():
        return render_template("index.html")
```

## Development Notes

For local development, you should modify the following files in your top-level CTFd folder to enable real-time updating of the site when running with docker:

### docker-entrypoint.sh
```diff
 # Start CTFd
 echo "Starting CTFd"
-exec gunicorn 'CTFd:create_app()' \
-    --bind '0.0.0.0:8000' \
-    --workers $WORKERS \
-    --worker-tmp-dir "$WORKER_TEMP_DIR" \
-    --worker-class "$WORKER_CLASS" \
-    --access-logfile "$ACCESS_LOG" \
-    --error-logfile "$ERROR_LOG"
+# Disable Gunicorn and use flask debug server instead
+exec python serve.py
```

### serve.py
```diff
-app.run(debug=True, threaded=True, host="127.0.0.1", port=args.port)
+# Disable cache so files update
+app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0
+# Make sure to use 0.0.0.0 so that the flask server is exposed out of the docker container
+# Use port 8000 since that is what is in the docker compose file
+app.run(debug=True, threaded=True, host="0.0.0.0", port=8000)
```

### docker-compose.yml
Disable nginx since we don't need it for local development.
```diff
-  nginx:
-    image: nginx:stable
-    restart: always
-    volumes:
-      - ./conf/nginx/http.conf:/etc/nginx/nginx.conf
-    ports:
-      - 80:80
-    depends_on:
-      - ctfd
-
```
