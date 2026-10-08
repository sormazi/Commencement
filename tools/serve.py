# Local server for NightView: serves this project's dist/ folder and tells the browser never to cache, so a
# reload always picks up the newest files. Usage: npm start  (or: npm start -- 4180 for another port)
import http.server, functools, os, sys
class NoCache(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control','no-store, max-age=0')
        super().end_headers()
root=os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','dist'))
port=int(sys.argv[1]) if len(sys.argv)>1 else 4173
try: server=http.server.ThreadingHTTPServer(('',port),functools.partial(NoCache,directory=root))
except OSError:
    sys.exit(f'Port {port} is already in use by another server (probably an old copy of NightView).\nStop it with:  lsof -ti:{port} | xargs kill   or start this one on another port:  npm start -- 4180')
print(f'Serving {root}\nOpen http://localhost:{port}  (Ctrl+C to stop)',flush=True)
server.serve_forever()
