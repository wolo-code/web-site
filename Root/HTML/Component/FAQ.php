<div id='message'>
	<ol>
		<li>
			<div class='content-li-title'>What is a Wolo Code?</div>
			<p>
				A short, word-based address for a point on the map: a city name plus three words from a public list of 1024 words.
				Say it, type it, or print it on a label, then decode it back to that same spot.
				The word list is at <a class='link' href='https://wcodes.org/wordlist'>wcodes.org/wordlist</a>.
			</p>
		</li>
		<li>
			<div class='content-li-title'>How precise is it?</div>
			<p>
				About 2 meters. You can mark a door, a gate, or a bench, and decode back to that point.
			</p>
		</li>
		<li>
			<div class='content-li-title'>Is it unique?</div>
			<p>
				City plus three words is unique.<br>
				The three words by themselves are unique only inside that city, so always share the city name with the words.
			</p>
		</li>
		<li>
			<div class='content-li-title'>Is it like a URL shortener?</div>
			<p>
				It is a short link to a place, but the code is already assigned to that point.
				Nothing is created on demand or stored on a central server just to exist.
			</p>
		</li>
		<li>
			<div class='content-li-title'>How is this different from other word addresses?</div>
			<p>
				Wolo Codes are scoped to a city, use a small public word list, and already exist for every point in a covered city.
				They do not need to be registered or synced before you can encode a location.
				See the <a href='/competition' data-target='competition' class='content-link XURL'>comparison</a>.
			</p>
		</li>
		<li>
			<div class='content-li-title'>Does it work offline?</div>
			<p>
				Yes for encode and decode after one online visit: the app shell, word list, cached cities, last map area, and queued saves keep working.
				Signing in and loading a map area you have not seen yet still need a connection.
			</p>
		</li>
		<li>
			<div class='content-li-title'>Do I need an account?</div>
			<p>
				No. Search, encode, decode, and share work without signing in.
				Optional Google or Facebook sign-in is only for account features such as saving addresses.
			</p>
		</li>
		<li>
			<div class='content-li-title'>Can I save addresses?</div>
			<p>
				Yes, after you sign in. Saves made while offline are queued and uploaded when you are back online.
			</p>
		</li>
		<li>
			<div class='content-li-title'>How do I share a location?</div>
			<p>
				Share the Wolo Code: city plus three words.
				You can also generate a printable label for a point of interest.
			</p>
		</li>
		<li>
			<div class='content-li-title'>What if my city is not listed?</div>
			<p>
				Request it from the app. Until it is added, use a nearby listed city, or change the city used for the same point.
			</p>
		</li>
		<li>
			<div class='content-li-title'>Can I change the city for the same location?</div>
			<p>
				Yes. The same coordinates encode to different three-word codes relative to different cities.
			</p>
		</li>
		<li>
			<div class='content-li-title'>Is there an app?</div>
			<p>
				The web app is at <a href='/' class='content-link'>wolo.codes</a>.
				Android is on Google Play. iOS and desktop are still to be announced.
				One link for every platform: <a href='/get' class='content-link'>wolo.codes/get</a>.
			</p>
		</li>
		<li>
			<div class='content-li-title'>Is it free?</div>
			<p>
				Public encode and decode on the site are free to use.
			</p>
		</li>
		<li>
			<div class='content-li-title'>What data do you collect?</div>
			<p>
				You can use the public tools without an account.
				If you sign in, Wolo Code asks only for basic profile information (name and email) so saved addresses can be tied to you.
				It does not ask to read Gmail, contacts, Drive, Facebook posts, or similar.
				See the <a href='/policy' data-target='policy' class='content-link XURL'>Privacy Policy</a>.
			</p>
		</li>
	</ol>
</div>
<?php require('../HTML/Fragment/Component_bottom_nav.php') ?>
