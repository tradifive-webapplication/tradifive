import os
import json
import time
import psutil
from http.server import HTTPServer, BaseHTTPRequestHandler

last_net = psutil.net_io_counters()
last_time = time.time()

class MetricsHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        global last_net, last_time
        if self.path == '/metrics':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()

            current_net = psutil.net_io_counters()
            current_time = time.time()
            dt = current_time - last_time
            if dt == 0: dt = 1
            
            # KB/s
            kb_recv = ((current_net.bytes_recv - last_net.bytes_recv) / 1024) / dt
            kb_sent = ((current_net.bytes_sent - last_net.bytes_sent) / 1024) / dt

            last_net = current_net
            last_time = current_time

            metrics = {
                "cpu": psutil.cpu_percent(interval=0.1),
                "memory": psutil.virtual_memory().percent,
                "network_in": round(kb_recv, 1),
                "network_out": round(kb_sent, 1),
                "active_connections": len(psutil.net_connections()),
            }
            
            self.wfile.write(json.dumps(metrics).encode())
        else:
            self.send_response(404)
            self.end_headers()

def run_server():
    port = 8005
    server_address = ('', port)
    httpd = HTTPServer(server_address, MetricsHandler)
    print(f"Metrics server running on port {port}...")
    httpd.serve_forever()

if __name__ == '__main__':
    run_server()
