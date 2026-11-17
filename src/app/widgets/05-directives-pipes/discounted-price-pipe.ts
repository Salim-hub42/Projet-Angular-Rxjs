import { Pipe, PipeTransform } from '@angular/core';

export function applyDiscount(price: number, discount: number): number {
  return price * (1 - discount);
}

@Pipe({
  name: 'discountedPrice',
})
export class DiscountedPricePipe implements PipeTransform {
  transform(price: number, discount: number): number {
    return applyDiscount(price, discount);
  }
}
