<div id='message'>
	<ol>
		<li>
			<div class='content-li-title'>Is it like a URL shortener?</div>
			<p>
				Yes and no.<br>
				It is a short link to a point on Earth, but the code is already allocated to that point.
				It is not created one-by-one and stored on a central server.
			</p>
		</li>
		<li>
			<div class='content-li-title'>What is a Wolo Code?</div>
			<p>
				A city name plus three words from a fixed list of 1024 words.
				Together they point to a ground location inside that city, at about 2 metre resolution.
				The word list is public at <a class='link' href='https://wcodes.org/wordlist'>wcodes.org/wordlist</a>.
			</p>
		</li>
		<li>
			<div class='content-li-title'>Is it unique?</div>
			<p>
				A full Wolo Code (city plus three words) is unique.<br>
				The last three words alone are unique only within that city.
			</p>
		</li>
		<li>
			<div class='content-li-title'>How precise is it?</div>
			<p>
				About 2 metres. Encode a door, a gate, or a spot in a park, then decode back to that same point.
			</p>
		</li>
		<li>
			<div class='content-li-title'>Does it work offline?</div>
			<p>
				Yes for the core encoder after one online visit: shell, word list, cached cities, last map area tiles, and queued saves work offline.
				Firebase sign-in and unseen map areas still need a network.
			</p>
		</li>
		<li>
			<div class='content-li-title'>Do I need an account?</div>
			<p>
				No. Encode, decode, search, and share without signing in.
				Google or Facebook sign-in is optional, and only used for account features such as saving addresses.
			</p>
		</li>
		<li>
			<div class='content-li-title'>What data do you collect?</div>
			<p>
				Public tools do not require an account.
				If you sign in, Wolo Code requests basic profile information (name and email) so saved addresses can be associated with you.
				It does not ask to read Gmail, contacts, Drive, Facebook posts, or similar.
				See the <a href='/policy' data-target='policy' class='content-link XURL'>Privacy Policy</a>.
			</p>
		</li>
		<li>
			<div class='content-li-title'>How is this different from what3words?</div>
			<p>
				Wolo Codes are scoped to a city, use a small public word list, and already exist for every point in a covered city, so they do not need to be registered or synced to generate.
				See the <a href='/competition' data-target='competition' class='content-link XURL'>comparison</a>.
			</p>
		</li>
		<li>
			<div class='content-li-title'>What if my city is not listed?</div>
			<p>
				You can request it from the app. Until it is added, pick a nearby listed city, or change the city used for the same point.
			</p>
		</li>
		<li>
			<div class='content-li-title'>Can I change the city for the same location?</div>
			<p>
				Yes. The same coordinates can encode to different three-word codes relative to different cities.
			</p>
		</li>
		<li>
			<div class='content-li-title'>How do I share a location?</div>
			<p>
				Share the Wolo Code (city plus three words). You can also generate a printable label for a point of interest.
			</p>
		</li>
		<li>
			<div class='content-li-title'>Can I save addresses?</div>
			<p>
				Yes, with an optional signed-in account. Saves made while offline are queued and sent when you are back online.
			</p>
		</li>
		<li>
			<div class='content-li-title'>Is there an app?</div>
			<p>
				The web app is at <a href='/' class='content-link'>wolo.codes</a>.
				Android is on Google Play. iOS and desktop are still to be announced.
				A unified link is <a href='/get' class='content-link'>wolo.codes/get</a>.
			</p>
		</li>
		<li>
			<div class='content-li-title'>Is it free?</div>
			<p>
				The public encode and decode tools on the site are free to use.
			</p>
		</li>
	</ol>
</div>
<?php require('../HTML/Fragment/Component_bottom_nav.php') ?>
