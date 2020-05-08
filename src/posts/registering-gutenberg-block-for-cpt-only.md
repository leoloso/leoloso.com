---
title: 🔥 Registering a Gutenberg block for a specific Custom Post Type only
metaDesc: Avoid polluting the WordPress editor with unneeded blocks
socialImage: /images/gutenberg-logo.png
date: '2021-05-08'
tags:
  - wordpress
  - gutenberg
  - development
---

For my GraphQL API for WordPress plugin (to be released soon, yay!), I have created several Custom Post Types, which are elegantly operated through custom Gutenberg blocks.

For instance, the GraphiQL block is used to create persisted GraphQL queries:

![Creating a persisted GraphQL query with a custom GraphiQL block](/images/graphql-query-gutenberg-block.png)

Now, this block is not a content block, but a configuration block: it is used by the Custom Post Type (or "CPT") called "GraphQL Persisted Query" to configure the GraphQL server. 

I do not want to make this block available when editing a normal post, since it just makes no sense there. Sure, I could just leave it there and never use it, but then the WordPress editor would be polluted with blocks that I do not need, and can't even use, and because they are still loaded the editor takes longer to initialize. So removing it completely whenever not needed seems like a very good idea.

## First (failed) attempt: using hook "allowed_block_types"

WordPress provides [filter `"allowed_block_types"`](https://developer.wordpress.org/reference/hooks/allowed_block_types/) to modify what block types are allowed for a post. However, this filter does not initially receive the array with all registered blocks, but a `true` boolean value. Hence, we must first obtain the array of all blocks, as to substract the unwanted items from the list.

We would normally expect to obtain the list of all blocks from calling function `WP_Block_Type_Registry::get_instance()->get_all_registered()`, but this returns only blocks registered through `register_block_types`, and many core blocks (such as `"core/paragraph"`) are not. Hence, we would need to know the list of all core blocks not registered with `register_block_types` and manually add them to the list. But then, we need to watch future releases for new unregistered core blocks and add them to the list too... No, thanks! Too much bureaucracy does not make a good solution, and bugs are bound to happen.

## Second (unsatisfactory) attempt: through JS code

We can use JavaScript function `wp.blocks.unregisterBlockType` to remove the block. But I find this solution quite unsatisfactory, because:

- We must first register the block in PHP as to then unregister it in JavaScript
- The post type is defined in PHP but validated in JavaScript, so the code is not DRY (Don't Repeat Yourself), which can potentially create bugs (eg: renaming the post type in PHP and forgetting to do it in JavaScript)
- The block script is still loaded, affecting performance
- Coding in JavaScript requires extra steps (compilation, bundling, etc), meaning extra bureaucracy

## Third (final) attempt: Register block only if post is of right type

How can I enable a block for a specific CPT only? The solution is initially simple:

- In the edit screen, check the post type of the new post or post being edited
- If it is the right CPT, only then register the block

However, WordPress doesn't provide a function similar to `is_singular($some_post_type)` for the admin panel, as to determine the post type of the object being edited. And even though this information is stored under global variable `$typenow`, unfortunately this variable has not been set by the time we register our scripts (under hook `"init"`), so we can't use it yet.

Then, we must recreate the logic to determine the current post type through these steps:

- Check if we are on the admin
- Get the value of global variable `$pagenow` (which has been set by the time the `"init"` hook is invoked)
- Obtain the post type like this:
    - If it is `post-new.php`, get the post type from parameter `'post_type'`
    - If it is `post.php`, get the post type from the object being edited
- If this is the right CPT, only then register my block

Here is the code:

```php
add_action('init', 'maybe_register_custom_block');
function maybe_register_custom_block(): void
{
  // For the admin, register the block only if in the right CPT
  if (is_admin()) {
    global $pagenow;
    $typenow = '';
    if ( 'post-new.php' === $pagenow ) {
      if ( isset( $_REQUEST['post_type'] ) && post_type_exists( $_REQUEST['post_type'] ) ) {
        $typenow = $_REQUEST['post_type'];
      };
    } elseif ( 'post.php' === $pagenow ) {
      if ( isset( $_GET['post'] ) && isset( $_POST['post_ID'] ) && (int) $_GET['post'] !== (int) $_POST['post_ID'] ) {
        // Do nothing
      } elseif ( isset( $_GET['post'] ) ) {
        $post_id = (int) $_GET['post'];
      } elseif ( isset( $_POST['post_ID'] ) ) {
        $post_id = (int) $_POST['post_ID'];
      }
      if ( $post_id ) {
        $post = get_post( $post_id );
        $typenow = $post->post_type;
      }
    }
    if ($typenow != 'my-custom-post-type') {
      return;
    }
  }

  /**
   * Only now register the block
   * @see https://developer.wordpress.org/block-editor/tutorials/block-tutorial/writing-your-first-block-type/
   */
  $asset_file = include( plugin_dir_path( __FILE__ ) . 'build/index.asset.php');
  wp_register_script(
      'my-custom-block',
      plugins_url( 'build/block.js', __FILE__ ),
      $asset_file['dependencies'],
      $asset_file['version']
  );
  register_block_type( 'my-namespace/my-custom-block-name', array(
      'editor_script' => 'my-custom-block',
  ) );
}
```

Enjoy! 👋🏻