ASE to CSV converter
==================

This program parses ASE files as exported by 3DS MAX and builds a tree representation of the data. It can then collect specific data
and export it to CSV. The program currently exports the materials referenced in objects to CSV.

This is an HTML5 application, and it should mostly work on recent Mozilla or webkit-based browsers, as it uses the File API and the Blob.slice
function to load big files in small chunks. It may work under IE10 if Microsoft removed the limit to the data: urls (that is, until BlobBuilder 
is ready).

There's no server, as everything is done in the browser, so it can work offline.

This really was a side project, quick and dirty, so if you happen to have some use for it, enjoy the hacking. Sorry for the lack of comments.

You can test the program at the following url: http://kornr.net/3DSExport/ASE-export.html

LICENCE
======

This program is provided under the terms of the APACHE V2 LICENCE

