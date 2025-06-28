# Lazy Continuation Line Violations

## Varying Indentation

1. List item
lazy
 lazy
    lazy
   ok
   1. List Item
lazy
   lazy
       lazy
      ok

## Blockquotes

> 1. List item
lazy
>    1. List item
lazy

1. > List item
lazy
   1. > List item
lazy

> 1. > List item
lazy
>    1. > List item
lazy

1. > > > List item
lazy
   1. > > > List item
lazy

> 1. > > > List item
lazy
>    1. > > > List item
lazy

## Second Paragraph

- List item
  ok

  new paragraph
lazy
   lazy
  ok

## Strong

- List item **ok**

- List
**lazy**

## Emphasis

- List item _ok_

- List
_lazy_

## Descriptive Link

- List item [ok](ok)

- List
[lazy](lazy)

## Bare Link

- List item <ok.md>

- List
<lazy.md>

## Image

- List item ![!ok](ok)

- List
![!lazy](lazy)

## Code

- List item `ok`

- List
`lazy`

## Optional Admonition

1. List item
   ok
   !!! ok
       ok if admonitions true
   ok: admonition ended just before this line
lazy
       lazy

   !!! ok
       ok if admonitions true
lazy

## OK Indented Code Block

1. List item

        indented code block
         ok
       ok: this will need a separate rule

## OK Checkbox

- [] List item ok

## OK Comment

1. List item
<!--ok-->

## OK Lists with No Content

1.
    1.

1.
MD032
    1.
MD032

-
  -

-
MD003,MD022
  -
MD022
