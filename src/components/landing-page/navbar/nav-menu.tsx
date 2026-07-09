import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList
} from '@/components/ui/navigation-menu';
import { NavigationMenuProps } from '@radix-ui/react-navigation-menu';
import Link from 'next/link';

export const NavMenu = (props: NavigationMenuProps) => (
  <NavigationMenu {...props}>
    <NavigationMenuList className='gap-6 space-x-0 data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-start'>
      <NavigationMenuItem>
        <NavigationMenuLink asChild>
          <Link href='/'>Beranda</Link>
        </NavigationMenuLink>
      </NavigationMenuItem>
      <NavigationMenuItem>
        <NavigationMenuLink asChild>
          <Link href='#features'>Fitur</Link>
        </NavigationMenuLink>
      </NavigationMenuItem>
      <NavigationMenuItem>
        <NavigationMenuLink asChild>
          <Link href='#faq'>FAQ</Link>
        </NavigationMenuLink>
      </NavigationMenuItem>
      {/* <NavigationMenuItem>
        <NavigationMenuLink asChild>
          <Link href="#testimonials">Testimoni</Link>
        </NavigationMenuLink>
      </NavigationMenuItem> */}
      <NavigationMenuItem>
        <NavigationMenuLink asChild>
          <Link href='#pricing'>Harga</Link>
        </NavigationMenuLink>
      </NavigationMenuItem>
    </NavigationMenuList>
  </NavigationMenu>
);
