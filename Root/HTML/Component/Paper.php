<div id='message' class='no-auto-cover'>
	<article class='paper-container'>

		<!-- Paper Header -->
		<header class='paper-header'>
			<div class='paper-meta-badge'>IEEE Conference Paper Format</div>
			<h1 class='paper-main-title'>A method of encoding geographic latitude and longitude into sequence of words</h1>
			<div class='paper-authors'>
				<div class='paper-author-name'>Ujjwal Singh</div>
				<div class='paper-author-affil'>
					<em>wolo.codes</em><br>
					Bangalore, India<br>
					<a class='content-link' href='mailto:ujjwal@wolo.codes'>ujjwal@wolo.codes</a>
				</div>
			</div>
			<div class='paper-actions'>
				<a class='paper-btn paper-btn-primary' href='/paper/wolo-technical-paper.pdf' target='_blank' rel='noopener' title='Download complete paper in original IEEE PDF format'>
					<svg viewBox='0 0 24 24' aria-hidden='true'><path d='M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z'/></svg>
					<span>Download PDF</span>
				</a>
				<span class='paper-version-tag'>doc v1.2.0</span>
			</div>
		</header>

		<!-- Abstract & Keywords -->
		<div class='paper-abstract-box'>
			<p>
				<span class='paper-abstract-title'>Abstract&mdash;</span>Geographic coordinates are long complex set of numbers and symbols that are difficult to communicate e.g. 27.9881 N, 86.9250 E. The solution presented here transforms geo coordinates into a sequence of three words preceded with the name of the locality it belongs to, which is generally a city (e.g. Bangalore cat apple tomato) or a region with an anchor index for rural and global coverage (e.g. Nepal 1112 candle kiwi mango). The size of the dictionary of the words used is only 1024 words. Thereby allowing the most simple words to be chosen that are unambiguous and easy to communicate.
			</p>
			<div class='paper-keywords'>
				<strong>Keywords:</strong> Geographic latitude longitude, word encoding
			</div>
		</div>

		<!-- Section I: Introduction -->
		<section>
			<h2 class='paper-sec-heading'><span class='paper-sec-num'>I.</span><span>Introduction</span></h2>
			<p>
				It is generally difficult to communicate coordinates, and to manually input them into a computer system. On the other hand words are easy &ndash; both to communicate and input; and also to remember. Thus transforming the geographic co-ordinates into words, from which the original data can be retrieved &ndash; makes it easy to handle. Of the output code &ndash; the name of the locality in the beginning (a city name, or a region name followed by a local anchor index) specifies the central reference point and the next three words specify the exact point relative to it. Additionally if the locality is implicit, the three words alone suffice.
			</p>
		</section>

		<!-- Section II: Theory -->
		<section>
			<h2 class='paper-sec-heading'><span class='paper-sec-num'>II.</span><span>Theory</span></h2>
			<p>
				Let there be a square grid <span class='math-var'>G</span> of <span class='math-var'>N</span> units.
			</p>
			<p>where,</p>
			<div class='paper-equation'>
				<div class='eq-math'><span class='math-var'>N</span> = 2<sup><span class='math-var'>L</span></sup></div>
				<div class='eq-num' id='eq-1'>(1)</div>
			</div>
			<p>
				and, <span class='math-var'>L</span> is Length in bits available for addressing one axis index of the two axes with any 3 of the 1024 words.
			</p>
			<p>Since,</p>
			<div class='paper-equation'>
				<div class='eq-math'>2<sup>10</sup> = 1024</div>
				<div class='eq-num'>(2)</div>
			</div>
			<div class='paper-equation'>
				<div class='eq-math'>
					<span class='math-var'>L</span> =
					<span class='fraction'>
						<span class='num'>3 &times; 10</span>
						<span class='den'>2</span>
					</span> = 15
				</div>
				<div class='eq-num'>(3)</div>
			</div>
			<p>thus, from (1):</p>
			<div class='paper-equation'>
				<div class='eq-math'><span class='math-var'>N</span> = 2<sup>15</sup> = 32,768</div>
				<div class='eq-num' id='eq-4'>(4)</div>
			</div>
			<p>
				Let there be a city whose boundary is represented by circle <span class='math-var'>S</span>, within which the point <span class='math-var'>P</span> with global co-ordinates (<span class='math-var'>&phi;</span>, <span class='math-var'>&lambda;</span>) lies. Let the center of grid <span class='math-var'>G</span> coincide with the center <span class='math-var'>C</span> of the circle <span class='math-var'>S</span>, such that the grid encompasses the circle completely.
			</p>

			<!-- Figure 1 -->
			<figure class='paper-figure'>
				<div class='paper-figure-card'>
					<img src='/paper/fig1.svg' width='332' height='288' loading='lazy' alt='Grid G with city boundary circle S and point P'>
				</div>
				<figcaption class='paper-figcaption'><strong>Fig. 1.</strong> Grid <em>G</em></figcaption>
			</figure>

			<!-- Subsection A: Process -->
			<h3 class='paper-subsec-heading'><span class='paper-subsec-num'>A.</span><span>Process</span></h3>
			<p>Following is the procedure flow:</p>

			<!-- Figure 2 -->
			<figure class='paper-figure'>
				<div class='paper-figure-card'>
					<img src='/paper/fig2.svg' width='232' height='320' loading='lazy' alt='Procedure flowchart: Input coordinates to Word code and reverse'>
				</div>
				<figcaption class='paper-figcaption'><strong>Fig. 2.</strong> Procedure</figcaption>
			</figure>

			<!-- Subsection B: Relative position -->
			<h3 class='paper-subsec-heading'><span class='paper-subsec-num'>B.</span><span>Relative position</span></h3>
			<p>
				First we find the relative position of the given point <span class='math-var'>P</span>(<span class='math-var'>&phi;</span>, <span class='math-var'>&lambda;</span>) on the grid <span class='math-var'>G</span>, as <span class='math-var'>P'</span>(<span class='math-var'>x</span>, <span class='math-var'>y</span>).
			</p>
			<p>
				Let <span class='math-var'>&Delta;</span> be the minimum distance in meters we want to resolve.<br>
				<span class='math-var'>&Delta;</span> is thus the distance between two consecutive integral points of the grid on any given axis.
			</p>
			<p>Then the total distance spanned by each side of the grid is:</p>
			<div class='paper-equation'>
				<div class='eq-math'><span class='math-var'>D</span> = <span class='math-var'>N</span> &times; <span class='math-var'>&Delta;</span></div>
				<div class='eq-num'>(5)</div>
			</div>
			<p>
				Let <span class='math-var'>&Theta;</span> be the angle that spans that total distance <span class='math-var'>D</span>.
			</p>
			<p>
				Similarly, <span class='math-var'>&theta;</span> is the angle that spans that distance <span class='math-var'>&Delta;</span>.
			</p>
			<p>The grid <span class='math-var'>G</span>'s origin <span class='math-var'>C'</span> has global co-ordinates:</p>
			<div class='paper-equation'>
				<div class='eq-math'>
					<span class='math-var'>C'</span><sub>(lat, lng)</sub> =
					&Bigl(
					<span class='math-var'>C</span><sub>lat</sub> &minus;
					<span class='fraction'>
						<span class='num'><span class='math-var'>&Theta;</span></span>
						<span class='den'>2</span>
					</span>, &ensp;
					<span class='math-var'>C</span><sub>lng</sub> &minus;
					<span class='fraction'>
						<span class='num'><span class='math-var'>&Theta;</span></span>
						<span class='den'>2</span>
					</span>
					&Bigr)
				</div>
				<div class='eq-num'>(6)</div>
			</div>
			<p>
				As we address only the integral points on the grid <span class='math-var'>G</span>, let <span class='math-var'>P'</span> be the integral point closest to the given point <span class='math-var'>P</span> on the Grid.<br>
				All points within the square range <span class='math-var'>R</span> are rounded off to this same intersecting point <span class='math-var'>P'</span>.<br>
				The indices <span class='math-var'>P'<sub>x</sub></span>, <span class='math-var'>P'<sub>y</sub></span> of <span class='math-var'>P'</span> will be based on the city it belongs to; i.e. the city-center <span class='math-var'>C</span> of the closest city within whose range it falls.
			</p>
			<p>Thus,</p>
			<div class='paper-equation'>
				<div class='eq-math'>
					<span class='math-var'>P'<sub>x</sub></span> = round&Biggl(
					<span class='fraction'>
						<span class='num'><span class='math-var'>P</span><sub>lat</sub> &minus; <span class='math-var'>C'</span><sub>lat</sub></span>
						<span class='den'><span class='math-var'>&theta;</span></span>
					</span>
					&Biggr)
				</div>
				<div class='eq-num'>(7)</div>
			</div>
			<p>and</p>
			<div class='paper-equation'>
				<div class='eq-math'>
					<span class='math-var'>P'<sub>y</sub></span> = round&Biggl(
					<span class='fraction'>
						<span class='num'><span class='math-var'>P</span><sub>lng</sub> &minus; <span class='math-var'>C'</span><sub>lng</sub></span>
						<span class='den'><span class='math-var'>&theta;</span></span>
					</span>
					&Biggr)
				</div>
				<div class='eq-num'>(8)</div>
			</div>
			<p>These indices must lie within range [0, <span class='math-var'>N</span>)</p>

			<!-- Subsection C: Packing -->
			<h3 class='paper-subsec-heading'><span class='paper-subsec-num'>C.</span><span>Packing</span></h3>
			<p>
				<span class='math-var'>P'<sub>x</sub></span> and <span class='math-var'>P'<sub>y</sub></span> are 15 bit numbers.<br>
				Thus totally they require 30 bits; and therefor: 3 &ndash; base-1024 numbers, to be packed into.<br>
				The relative latitude's (<span class='math-var'>P'<sub>x</sub></span>) first 10 bits go into the first number of the output code <span class='math-var'>W</span> as <span class='math-var'>W<sub>1</sub></span>. The relative longitude's (<span class='math-var'>P'<sub>y</sub></span>) first 10 bits go into the second number <span class='math-var'>W<sub>2</sub></span>. The remaining 5 bits of the relative latitude go into the first 5 bits of the third number <span class='math-var'>W<sub>3</sub></span> and finally the longitude's last 5 bits go into its last 5 bits.
			</p>

			<!-- Figure 3 -->
			<figure class='paper-figure'>
				<div class='paper-figure-card'>
					<img src='/paper/fig3.svg' width='273' height='147' loading='lazy' alt='Bit packing diagram of P_prime and W variables'>
				</div>
				<figcaption class='paper-figcaption'><strong>Fig. 3.</strong> Bits of <em>P'</em> and <em>W</em> variables</figcaption>
			</figure>

			<!-- Subsection D: Mapping -->
			<h3 class='paper-subsec-heading'><span class='paper-subsec-num'>D.</span><span>Mapping</span></h3>
			<p>
				A number system is based on the progressive series of weighted symbols.<br>
				In wcode we use 1024 symbols.
			</p>
			<p>
				The 3 10-bit numbers of the output code are mapped to words from a dictionary of 2<sup>10</sup> = 1024 weighted words.
			</p>

			<!-- Table 1 -->
			<div class='paper-table-wrap'>
				<div class='paper-table-caption'>Table I: WCode Word Table</div>
				<table class='paper-table'>
					<thead>
						<tr>
							<th style='text-align: right;'>Serial</th>
							<th style='text-align: center;'>Decimal</th>
							<th style='text-align: center;'>Binary</th>
							<th style='text-align: left;'><em>Word</em></th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td style='text-align: right;'>1</td>
							<td style='text-align: center;'>0</td>
							<td style='text-align: center; font-family: monospace;'>00000 00000</td>
							<td style='text-align: left;'>apple</td>
						</tr>
						<tr>
							<td style='text-align: right;'>2</td>
							<td style='text-align: center;'>1</td>
							<td style='text-align: center; font-family: monospace;'>00000 00001</td>
							<td style='text-align: left;'>mango</td>
						</tr>
						<tr>
							<td style='text-align: right;'>3</td>
							<td style='text-align: center;'>2</td>
							<td style='text-align: center; font-family: monospace;'>00000 00010</td>
							<td style='text-align: left;'>tomato</td>
						</tr>
						<tr>
							<td style='text-align: right;'>&hellip;</td>
							<td style='text-align: center;'>&hellip;</td>
							<td style='text-align: center;'>&hellip;</td>
							<td style='text-align: left;'>&hellip;</td>
						</tr>
						<tr>
							<td style='text-align: right;'>1024</td>
							<td style='text-align: center;'>1023</td>
							<td style='text-align: center; font-family: monospace;'>11111 11111</td>
							<td style='text-align: left;'>zebra</td>
						</tr>
					</tbody>
				</table>
			</div>

			<p>
				Only the simplest words that have easy pronunciation and spellings, and are distinct are used.
			</p>
			<p>
				The three numbers of output code <span class='math-var'>W</span> are mapped to the corresponding words from this table as <span class='math-var'>W<sub>1</sub></span> to <span class='math-var'>W'<sub>1</sub></span> and so on as <span class='math-var'>W'</span>.
			</p>

			<!-- Subsection E: City and Regional Locality Variants -->
			<h3 class='paper-subsec-heading'><span class='paper-subsec-num'>E.</span><span>City and Regional Locality Variants</span></h3>
			<p>
				The output word code <span class='math-var'>W'</span> specifies a point relative to a geographic reference origin. Two locality addressing formats are supported:
			</p>

			<div class='paper-variant-card'>
				<h4 class='paper-variant-title'>1. City Variant</h4>
				<p>
					For locations within a registered city boundary, the name of the city precedes the three words of output code <span class='math-var'>W'</span>:
				</p>
				<div class='paper-code-example'>
					<code>&lt;city&gt; &lt;word<sub>1</sub>&gt; &lt;word<sub>2</sub>&gt; &lt;word<sub>3</sub>&gt;</code>
				</div>
				<p class='paper-example-caption'>
					<strong>E.g.</strong> <code>Bangalore cat apple tomato</code>
				</p>
			</div>

			<div class='paper-variant-card'>
				<h4 class='paper-variant-title'>2. Region Variant (Global &amp; Rural Coverage)</h4>
				<p>
					For locations outside registered cities &ndash; in rural, wilderness, maritime, or unmapped global areas &ndash; the system provides a named regional anchor reference.
				</p>
				<p>
					The globe is partitioned into a fixed grid of half-degree anchor tiles (360 rows &times; 720 columns, each tile spanning 0.5&deg; &times; 0.5&deg;). Each named geographic region or administrative territory (countries, states, physical features) maintains a deterministic, frozen index of its intersecting global anchor tiles.
				</p>
				<div class='paper-code-example'>
					<code>&lt;region&gt; &lt;index&gt; &lt;word<sub>1</sub>&gt; &lt;word<sub>2</sub>&gt; &lt;word<sub>3</sub>&gt;</code>
				</div>
				<p class='paper-example-caption'>
					<strong>E.g.</strong> <code>Nepal 1112 candle kiwi mango</code> &ensp;<em>(or <code>India 1112 candle kiwi mango</code>)</em>
				</p>
				<p>
					Here, the numeric <code>&lt;index&gt;</code> identifies the 1-based local anchor tile within that region's namespace, establishing the local grid origin <span class='math-var'>C'</span>. The subsequent three words specify the exact relative point within that tile at the standard 2&nbsp;m resolution using the identical 30-bit word encoding algorithm and 1024-word dictionary.
				</p>
			</div>

			<!-- Subsection F: Reversal -->
			<h3 class='paper-subsec-heading'><span class='paper-subsec-num'>F.</span><span>Reversal</span></h3>
			<p>
				The above process is reversed to obtain the original co-ordinates of the point <span class='math-var'>P'</span> from the output code <span class='math-var'>W</span> by:
			</p>
			<div class='paper-equation'>
				<div class='eq-math'>
					<span class='math-var'>P'</span><sub>lat</sub> = <span class='math-var'>C'</span><sub>lat</sub> + <span class='math-var'>P'<sub>x</sub></span> &times; <span class='math-var'>&theta;</span>
				</div>
				<div class='eq-num'>(9)</div>
			</div>
			<p>and</p>
			<div class='paper-equation'>
				<div class='eq-math'>
					<span class='math-var'>P'</span><sub>lng</sub> = <span class='math-var'>C'</span><sub>lng</sub> + <span class='math-var'>P'<sub>y</sub></span> &times; <span class='math-var'>&theta;</span>
				</div>
				<div class='eq-num'>(10)</div>
			</div>

			<!-- Subsection G: Total unique addresses -->
			<h3 class='paper-subsec-heading'><span class='paper-subsec-num'>G.</span><span>Total unique addresses</span></h3>
			<p>
				From eq (<a href='#eq-4'>4</a>) the total addressable points <span class='math-var'>T</span> on the grid <span class='math-var'>G</span> become:
			</p>
			<div class='paper-equation'>
				<div class='eq-math'><span class='math-var'>T</span> = <span class='math-var'>N</span> &times; <span class='math-var'>N</span> = 1,073,741,824</div>
				<div class='eq-num'>(11)</div>
			</div>

			<!-- Subsection H: Resolution -->
			<h3 class='paper-subsec-heading'><span class='paper-subsec-num'>H.</span><span>Resolution</span></h3>
			<p>
				Targeting a resolution of 2 m, we set:
			</p>
			<div class='paper-equation'>
				<div class='eq-math'><span class='math-var'>&Delta;</span> = 2 m</div>
				<div class='eq-num'>(12)</div>
			</div>
			<p>
				Thus effectively the resolution on either side is only 1 m.<br>
				And,
			</p>
			<div class='paper-equation'>
				<div class='eq-math'><span class='math-var'>D</span> = 65.534 km</div>
				<div class='eq-num'>(13)</div>
			</div>

			<!-- Subsection I: Approximation -->
			<h3 class='paper-subsec-heading'><span class='paper-subsec-num'>I.</span><span>Approximation</span></h3>

			<!-- Figure 4 -->
			<figure class='paper-figure'>
				<div class='paper-figure-card'>
					<img src='/paper/fig4.svg' width='301' height='197' loading='lazy' alt='Lateral projection of spheroid representing Earth'>
				</div>
				<figcaption class='paper-figcaption'><strong>Fig. 4.</strong> Lateral projection of spheroid representing Earth</figcaption>
			</figure>

			<p>
				Since the surface of Earth is not a perfect sphere as it is compressed from top and bottom, it is best represented by a spheroid.<br>
				The maths used below assumes this approximation and conforms to World Geodetic System &ndash; WGS84 [<a href='#ref-1'>1</a>].<br>
				The values of the axes of the WGS84 ellipsoid is as given below:
			</p>

			<!-- Table 2 -->
			<div class='paper-table-wrap'>
				<div class='paper-table-caption'>Table II: WGS84 Axes Table</div>
				<table class='paper-table'>
					<thead>
						<tr>
							<th style='text-align: center;'>Semi-major axis : <em>a</em></th>
							<th style='text-align: center;'>Semi-minor axis : <em>b</em></th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td style='text-align: center;'>6 378 137 . 0 m</td>
							<td style='text-align: center;'>6 356 752 . 314 140 m</td>
						</tr>
					</tbody>
				</table>
			</div>

			<p>
				Let <span class='math-var'>e</span> be the eccentricity of the ellipsoid, related to its major and minor axes by:
			</p>
			<div class='paper-equation'>
				<div class='eq-math'>
					<span class='math-var'>e</span><sup>2</sup> =
					<span class='fraction'>
						<span class='num'><span class='math-var'>a</span><sup>2</sup> &minus; <span class='math-var'>b</span><sup>2</sup></span>
						<span class='den'><span class='math-var'>a</span><sup>2</sup></span>
					</span>
				</div>
				<div class='eq-num'>(14)</div>
			</div>

			<!-- Subsection J: Latitude adjustment -->
			<h3 class='paper-subsec-heading'><span class='paper-subsec-num'>J.</span><span>Latitude adjustment</span></h3>
			<p>
				The span angle <span class='math-var'>&Theta;</span> for latitude is independent of longitude but has to be adjusted based on latitude.<br>
				Since, the length of a degree of latitude is given by the following equation [<a href='#ref-2'>2</a>]:
			</p>
			<div class='paper-equation'>
				<div class='eq-math'>
					<span class='math-var'>&Delta;</span><sup>1</sup><sub>lat</sub> =
					<span class='fraction'>
						<span class='num'>&pi; &middot; <span class='math-var'>a</span> &middot; (1 &minus; <span class='math-var'>e</span><sup>2</sup>)</span>
						<span class='den'>180&deg; (1 &minus; <span class='math-var'>e</span><sup>2</sup> sin<sup>2</sup><span class='math-var'>&phi;</span>)<sup>3/2</sup></span>
					</span>
				</div>
				<div class='eq-num'>(15)</div>
			</div>
			<p>
				Then the latitude angle <span class='math-var'>&theta;</span><sub>lat</sub> spanning distance <span class='math-var'>&Delta;</span> with a resolution of 2 m, is given by:
			</p>
			<div class='paper-equation'>
				<div class='eq-math'>
					<span class='math-var'>&theta;</span><sub>lat</sub> = 2 &middot;
					<span class='fraction'>
						<span class='num'>1</span>
						<span class='den'><span class='math-var'>&Delta;</span><sup>1</sup><sub>lat</sub></span>
					</span>
				</div>
				<div class='eq-num'>(16)</div>
			</div>
			<p>
				and, the total span angle <span class='math-var'>&Theta;</span><sub>lat</sub> becomes:
			</p>
			<div class='paper-equation'>
				<div class='eq-math'>
					<span class='math-var'>&Theta;</span><sub>lat</sub> = 2 &middot;
					<span class='fraction'>
						<span class='num'><span class='math-var'>N</span></span>
						<span class='den'><span class='math-var'>&Delta;</span><sup>1</sup><sub>lat</sub></span>
					</span>
				</div>
				<div class='eq-num'>(17)</div>
			</div>

			<!-- Subsection K: Longitude adjustment -->
			<h3 class='paper-subsec-heading'><span class='paper-subsec-num'>K.</span><span>Longitude adjustment</span></h3>
			<p>
				As the lines of longitude converge at the poles, the distance spanned by them changes based on the latitude. It depends only on the radius of a circle of latitude. The length of a degree of longitude is given by the following equation [<a href='#ref-3'>3</a>]:
			</p>
			<div class='paper-equation'>
				<div class='eq-math'>
					<span class='math-var'>&Delta;</span><sup>1</sup><sub>lng</sub> =
					<span class='fraction'>
						<span class='num'>&pi; &middot; <span class='math-var'>a</span> &middot; cos <span class='math-var'>&phi;</span></span>
						<span class='den'>180&deg; <span class='sqrt-symbol'>&radic;</span><span class='sqrt-body'>1 &minus; <span class='math-var'>e</span><sup>2</sup> sin<sup>2</sup><span class='math-var'>&phi;</span></span></span>
					</span>
				</div>
				<div class='eq-num'>(18)</div>
			</div>
			<p>
				Then the longitude angle <span class='math-var'>&theta;</span><sub>lng</sub> spanning distance <span class='math-var'>&Delta;</span> with a resolution of 2 m, is given by:
			</p>
			<div class='paper-equation'>
				<div class='eq-math'>
					<span class='math-var'>&theta;</span><sub>lng</sub> = 2 &middot;
					<span class='fraction'>
						<span class='num'>1</span>
						<span class='den'><span class='math-var'>&Delta;</span><sup>1</sup><sub>lng</sub></span>
					</span>
				</div>
				<div class='eq-num'>(19)</div>
			</div>
			<p>
				and, the total span angle <span class='math-var'>&Theta;</span><sub>lng</sub> becomes:
			</p>
			<div class='paper-equation'>
				<div class='eq-math'>
					<span class='math-var'>&Theta;</span><sub>lng</sub> = 2 &middot;
					<span class='fraction'>
						<span class='num'><span class='math-var'>N</span></span>
						<span class='den'><span class='math-var'>&Delta;</span><sup>1</sup><sub>lng</sub></span>
					</span>
				</div>
				<div class='eq-num'>(20)</div>
			</div>
		</section>

		<!-- References -->
		<section>
			<h2 class='paper-sec-heading'><span class='paper-sec-num'>III.</span><span>References</span></h2>
			<ol class='paper-ref-list'>
				<li id='ref-1'>
					<span class='paper-ref-num'>[1]</span>
					World Geodetic System &ndash; 1984 (WGS84) Manual.<br>
					<a class='content-link paper-ref-link' href='https://gis.icao.int/eganp/webpdf/REF08-Doc9674.pdf' target='_blank' rel='noopener'>https://gis.icao.int/eganp/webpdf/REF08-Doc9674.pdf</a>
				</li>
				<li id='ref-2'>
					<span class='paper-ref-num'>[2]</span>
					Osborne, Peter (2013). &ldquo;Chapters 5, 6&rdquo;. <em>The Mercator Projections</em>. doi:10.5281/zenodo.35392. for LaTeX code and figures.<br>
					<a class='content-link paper-ref-link' href='https://doi.org/10.5281/zenodo.35392' target='_blank' rel='noopener'>https://doi.org/10.5281/zenodo.35392</a>
				</li>
				<li id='ref-3'>
					<span class='paper-ref-num'>[3]</span>
					Rapp, Richard H. (1991). &ldquo;Chapter 3&rdquo;. <em>Geometric Geodesy, Part I</em>. Columbus, OH: Dept. of Geodetic Science and Surveying, Ohio State Univ.<br>
					<a class='content-link paper-ref-link' href='http://hdl.handle.net/1811/24333' target='_blank' rel='noopener'>http://hdl.handle.net/1811/24333</a>
				</li>
			</ol>
		</section>

		<!-- Footer metadata -->
		<footer class='paper-footer-meta'>
			<div>Original Paper: <em>A method of encoding geographic latitude and longitude into sequence of words</em></div>
			<div><strong>doc v1.2.0</strong></div>
		</footer>

	</article>
</div>
<?php require('../HTML/Fragment/Component_bottom_nav.php') ?>
