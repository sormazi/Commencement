# Local server for NightView: serves dist/ on port 4173 and tells the browser never to cache, so a reload
# always picks up the newest files (no more stale modules after an update). Usage: npm start
import http.server, functools, os
class NoCache(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control','no-store, max-age=0')
        super().end_headers()
root=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','dist')
http.server.ThreadingHTTPServer(('',4173),functools.partial(NoCache,directory=root)).serve_forever()
