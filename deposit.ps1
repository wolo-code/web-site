mv public\index.html public\index_html
copy-item -Path ".\\public\\*" -exclude "root.json","index_html",".htaccess","manifest.json",".git" -Destination "..\\..\\App\\Project\\public" -Recurse -Force
mv public\index_html public\index.html
