<?php
	require_once 'Fragment/Item.php';
?>
<div id='nav-menu'>
	<div id='nav-menu_container'>
		<div class='sidebar-nav-li sidebar-sub'>
<?php
			$SIDEBAR_NAV_GROUP = 'sidebar-nav-group page-list';
			$MENU_MAX_ITEM_COUNT = -7;
			group_text($SIDEBAR_NAV_GROUP, $MENU_MAX_ITEM_COUNT, ['//wolo.codes', 'App'], ['press_release\launch', 'Launch']);
			group_text($SIDEBAR_NAV_GROUP, $MENU_MAX_ITEM_COUNT, ['about', 'About'], ['faq', 'FAQ'], ['features', 'Features'], ['case', 'Case'], ['competition', 'Competition'], ['presentation', 'Presentation']);
			group_text($SIDEBAR_NAV_GROUP, $MENU_MAX_ITEM_COUNT, ['downloads', 'Downloads']);
			group_text($SIDEBAR_NAV_GROUP, $MENU_MAX_ITEM_COUNT, ['terms', 'Terms of use'], ['policy', 'Privacy policy'], ['data_deletion', 'Data Deletion'], ['license', 'License'], ['logo', 'Logo']);
			group_text($SIDEBAR_NAV_GROUP, $MENU_MAX_ITEM_COUNT, ['//wcodes.org', 'WCodes'], ['//wcodes.org/wordlist', 'Wordlist']);
			group_text($SIDEBAR_NAV_GROUP, $MENU_MAX_ITEM_COUNT, ['about_me', 'About me'], ['media', 'Media']);
?>
		</div>
	</div>
</div>
