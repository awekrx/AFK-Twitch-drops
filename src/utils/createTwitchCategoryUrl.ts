const specialCharacterRegex = /[^a-zA-Z0-9\-]+/g;
const spaceRegex = /[^\S]+/g;

export const createTwitchCategoryUrl = (category: string) => {
  return category.replace(spaceRegex, '-').replace(specialCharacterRegex, '');
};
