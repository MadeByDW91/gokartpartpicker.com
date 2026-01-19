/**
 * Server Actions - Barrel Export
 * 
 * Import server actions from this file for a cleaner API:
 * import { getEngines, createBuild } from '@/actions';
 */

// Engine actions (public)
export { 
  getEngines, 
  getEngine,
  getEngineBySlug,
  getEngineBrands 
} from './engines';

// Part actions (public)
export { 
  getParts, 
  getPartsByCategory,
  getPart,
  getPartBySlug,
  getPartsById,
  getPartBrands,
  getPartCategories 
} from './parts';

// Build actions (mixed auth)
export { 
  createBuild,
  updateBuild,
  deleteBuild,
  getBuild,
  getBuildByShareId,
  getUserBuilds,
  getPublicBuilds,
  addPartToBuild,
  removePartFromBuild 
} from './builds';

// Compatibility actions (public)
export { 
  getCompatibilityRules,
  getEnginePartCompatibility,
  getRulesForCategory,
  getRulesTargetingCategory,
  checkCompatibility,
  getBuildCompatibility,
  getCompatibleParts 
} from './compatibility';

// Admin actions (admin only)
export {
  createEngine,
  updateEngine,
  deleteEngine,
  restoreEngine,
  createPart,
  updatePart,
  deletePart,
  restorePart,
  getAdminEngines,
  getAdminEngine,
  getAdminParts,
  getAdminPart,
  requireAdmin,
  requireSuperAdmin
} from './admin';

// Admin compatibility actions (admin only)
export {
  getAdminCompatibilityRules,
  createCompatibilityRule,
  updateCompatibilityRule,
  deleteCompatibilityRule,
  toggleRuleActive
} from './admin/compatibility';

// Admin Amazon import actions (admin only)
export {
  fetchAmazonProduct,
  bulkFetchAmazonProducts
} from './admin/amazon-import';

// Admin engine clone actions (admin only)
export {
  getEngineClones,
  getAdminEngineClones,
  createEngineClone,
  updateEngineClone,
  deleteEngineClone,
  createBidirectionalClone,
  detectPotentialClones,
  autoCreateCloneRelationships
} from './admin/engine-clones';

// Admin affiliate analytics actions (admin only)
export {
  getAffiliateLinkStats,
  getAffiliateLinkItems,
  checkAffiliateLink
} from './admin/affiliate-analytics';

// Guide actions (public)
export {
  getGuides,
  getGuideBySlug,
  markGuideHelpful
} from './guides';

// Admin guide actions (admin only)
export {
  getAllGuides,
  getGuideById,
  createGuide,
  updateGuide,
  toggleGuidePublish,
  deleteGuide
} from './admin-guides';

// Admin auto video linking actions (admin only)
export {
  searchVideosForPart,
  autoLinkVideosToPart,
  suggestEngineCompatibility
} from './admin/auto-video-linker';

// Video actions (public)
export {
  getEngineVideos,
  getPartVideos,
  getFeaturedEngineVideos,
  getFeaturedPartVideos,
  getAllVideos
} from './videos';

// Profile actions (authenticated)
export {
  getProfile,
  updateProfile,
  getUserStats
} from './profile';
