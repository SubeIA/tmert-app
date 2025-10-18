import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { filter, distinctUntilChanged, map } from 'rxjs/operators';

export interface Breadcrumb {
  label: string;
  url: string;
}

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterLink],
  templateUrl: './breadcrumb.component.html',
  styleUrl: './breadcrumb.component.scss',
})
export class BreadcrumbComponent {
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  breadcrumbs: Breadcrumb[] = [];

  constructor() {
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        distinctUntilChanged(),
        map(() => this.buildBreadcrumbs(this.activatedRoute.root))
      )
      .subscribe(breadcrumbs => {
        this.breadcrumbs = breadcrumbs;
      });
  }

  private buildBreadcrumbs(
    route: ActivatedRoute,
    url = '',
    breadcrumbs: Breadcrumb[] = []
  ): Breadcrumb[] {
    const children: ActivatedRoute[] = route.children;

    if (children.length === 0) {
      return breadcrumbs;
    }

    for (const child of children) {
      if (!child.snapshot.data['breadcrumb']) {
        return this.buildBreadcrumbs(child, url, breadcrumbs);
      }

      const routeURL: string = child.snapshot.url.map(segment => segment.path).join('/');

      url += `/${routeURL}`;

      const breadcrumb: Breadcrumb = {
        label: child.snapshot.data['breadcrumb'],
        url: url,
      };

      breadcrumbs.push(breadcrumb);

      return this.buildBreadcrumbs(child, url, breadcrumbs);
    }

    return breadcrumbs;
  }
}
