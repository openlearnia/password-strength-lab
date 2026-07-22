export function ratingToMeterColor(rating: string): string {
  switch (rating) {
    case 'Excellent':
    case 'Strong':
      return '#3dd68c'
    case 'Moderate':
      return '#f5a623'
    default:
      return '#f28b82'
  }
}
