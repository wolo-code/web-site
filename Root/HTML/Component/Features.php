<div id='message'>
	<ol>
		<li>
			<h3>Encode</h3>
			<p>
				Any geo location is converted to a bunch of words.<br>
				The name of the city along with those three words is sufficient to get back to that precise point.
			</p>
			<p>
				e.g. The cafe - front entrance : 12&deg;58'19.6"N 77&deg;35'38.1"E : Bengaluru cat apple tomato
			</p>
		</li>
		<li>
			<h3>Decode</h3>
			<p>
				The words from the encode process when decoded return the precise geo location, with accuracy of 2 meters
			</p>
			<p>
				e.g. Bengaluru cat apple tomato : 12&deg;58'19.6"N 77&deg;35'38.1"E : The cafe - front entrance
			</p>
		</li>
		<li>
			<h3>QR</h3>
			<p>
				QR stickers can be generated that take the user directly to that point on map
			</p>
			<p>
				<?php $img_title='location_qr'; $ext='svg'; $extern='true'; $alt=''; $center='true'; require('Fragment\Component_image.php') ?>
			</p>
		</li>
		<li>
			<h3>Address book</h3>
			<p>
				Addresses can be saved to the cloud - so that they can be recalled directly.
			</p>
		</li>
		<li>
			<h3>Change city</h3>
			<p>
				The city with respect to which the code is generated for a given location can be manually changed.
			</p>
			<p>
				e.g. &lt;City_A&gt; cat apple tomato : 12&deg;58'19.6"N 77&deg;35'38.1"E : &lt;City_B&gt; mango cheese grape
			</p>
		</li>
		<li>
			<h3>Add city</h3>
			<p>
				In case if a city is not available in the database, a user can request the city to be added to the database.
			</p>
		</li>
	</ol>
</div>
<?php require('..\HTML\Fragment\Component_bottom_nav.php') ?>