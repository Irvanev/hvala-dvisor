// import { Wine, UtensilsCrossed, Leaf, Eye, Users } from "lucide-react";

// const iconMap = {
//   "Винная карта": Wine,
//   "Веганское меню": Leaf,
//   "Детское меню": Users,
//   "Панорамный вид": Eye,
//   "Домашняя паста": UtensilsCrossed,
//   "Терраса": Eye // например, можно использовать и другой подходящий значок
// };

// const Tag = ({ tag, type }) => {
//   const IconComponent = iconMap[tag];

//   return (
//     <span className={`${styles.tag} ${type === 'cuisine' ? styles.cuisineTag : styles.featureTag}`}>
//       {IconComponent && <IconComponent size={14} />}
//       {tag}
//     </span>
//   );
// };

// // использование в карточке
// <div className={styles.tagsContainer}>
//   {cuisineTags.map((tag, index) => (
//     <Tag key={`cuisine-${id}-${index}`} tag={tag} type="cuisine" />
//   ))}

//   {featureTags.map((tag, index) => (
//     <Tag key={`feature-${id}-${index}`} tag={tag} type="feature" />
//   ))}
// </div>