export default function generateApplicationId() {
  const year = new Date().getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `APP${year}_${rand}`;
}
