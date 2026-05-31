# tools/web.py
import requests
from bs4 import BeautifulSoup

class WebTools:
    @staticmethod
    def scrape_url(url: str):
        response = requests.get(url)
        if response.status_code == 200:
            soup = BeautifulSoup(response.content, 'html.parser')
            return soup.get_text()
        return f"Failed to retrieve URL: {response.status_code}"
