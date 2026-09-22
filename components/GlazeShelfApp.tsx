"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase";
import {
  Search,
  LogOut,
  Plus,
  ArrowRight,
  ShieldCheck,
  UserRound,
  MapPin,
  Layers,
  Compass,
  Share2,
  Eye,
  EyeOff,
} from "lucide-react";
import { AppHeader, BottomNavigation } from "./AppNavigation";
import {
  pathForScreen,
  screenForPath,
  type AppScreen,
} from "@/lib/app-routes";
import homeLogo from "../app/glaze-shelf-teal-purple-tagline.png";
import homeBowl from "../app/home-pottery-bowl.png";
import homeGlazeFlow from "../app/home-glaze-flow.png";
import spinnerCup from "../app/glaze-cup-logo-teal-purple.png";
const placementOptions = [
  "overall",
  "top half",
  "bottom half",
  "rim",
  "design only",
  "overlapping band",
];
const effectOptions = [
  "Waterfall",
  "Drippy",
  "Pools",
  "Fluid",
  "Stable",
  "Breaks on texture",
  "Reactive layering",
  "Crackle",
  "Matte",
  "Gloss",
  "Crystal",
];
const colorOptions = [
  "Blue",
  "Blue-Green",
  "Green",
  "White / Cream",
  "Black / Charcoal",
  "Brown",
  "Red",
  "Orange / Coral",
  "Yellow / Gold",
  "Pink",
  "Purple",
  "Clear",
];
const FINDER_PAGE_SIZE = 24;

async function optimizeImageFile(
  file: File,
  maxDimension: number,
  quality = 0.82,
) {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) return file;
  const sourceUrl = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = () => reject(new Error('This image could not be prepared for upload.'));
      element.src = sourceUrl;
    });
    const scale = Math.min(1, maxDimension / Math.max(image.naturalWidth, image.naturalHeight));
    const width = Math.max(1, Math.round(image.naturalWidth * scale));
    const height = Math.max(1, Math.round(image.naturalHeight * scale));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (!context) return file;
    context.drawImage(image, 0, 0, width, height);
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/webp', quality),
    );
    if (!blob || (scale === 1 && blob.size >= file.size)) return file;
    const baseName = file.name.replace(/\.[^.]+$/, '') || 'photo';
    return new File([blob], `${baseName}.webp`, {
      type: 'image/webp',
      lastModified: Date.now(),
    });
  } finally {
    URL.revokeObjectURL(sourceUrl);
  }
}
export default function GlazeShelfApp({
  initialScreen,
}: {
  initialScreen: AppScreen;
}) {
  const pathname = usePathname();
  const sb = useMemo(() => createClient(), []);
  const [session, setSession] = useState<any>(null),
    [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [authMode, setAuthMode] = useState<"signin" | "signup">("signin"),
    [signupConfirmPassword, setSignupConfirmPassword] = useState(""),
    [visiblePasswordFields, setVisiblePasswordFields] = useState<Set<string>>(new Set()),
    [msg, setMsg] = useState(""),
    [tab, setTabState] = useState<AppScreen>(initialScreen),
    [recovery, setRecovery] = useState(false),
    [newPassword, setNewPassword] = useState(""),
    [confirmPassword, setConfirmPassword] = useState("");
  const [shelf, setShelf] = useState<any[]>([]),
    [kind, setKind] = useState("glaze"),
    [q, setQ] = useState(""),
    [results, setResults] = useState<any[]>([]),
    [layers, setLayers] = useState<any[]>([]),
    [clay, setClay] = useState<any>(null),
    [cone, setCone] = useState(6),
    [bisqueCone, setBisqueCone] = useState("06"),
    [projectDescription, setProjectDescription] = useState(""),
    [orientation, setOrientation] = useState("vertical"),
    [texture, setTexture] = useState("smooth"),
    [goal, setGoal] = useState(""),
    [analysis, setAnalysis] = useState<any>(null),
    [recipes, setRecipes] = useState<any[]>([]),
    [recipeName, setRecipeName] = useState(""),
    [editingRecipeId, setEditingRecipeId] = useState(""),
    [recipeDetail, setRecipeDetail] = useState<any[]>([]),
    [shelfView, setShelfView] = useState("materials"),
    [studios, setStudios] = useState<any[]>([]),
    [studio, setStudio] = useState(""),
    [studioName, setStudioName] = useState(""),
    [join, setJoin] = useState(""),
    [joinMsg, setJoinMsg] = useState(""),
    [sharingRecipeId, setSharingRecipeId] = useState(""),
    [studioRecipesOpen, setStudioRecipesOpen] = useState(false),
    [studioRecipesList, setStudioRecipesList] = useState<any[]>([]),
    [studioRecipesLoading, setStudioRecipesLoading] = useState(false),
    [inviteCodeShown, setInviteCodeShown] = useState(""),
    [codeCopied, setCodeCopied] = useState(false),
    [editingInviteCode, setEditingInviteCode] = useState(false),
    [customCodeInput, setCustomCodeInput] = useState(""),
    [showTransferPanel, setShowTransferPanel] = useState(false),
    [showDeleteStudioPanel, setShowDeleteStudioPanel] = useState(false),
    [deleteStudioConfirmText, setDeleteStudioConfirmText] = useState(""),
    [deletingStudio, setDeletingStudio] = useState(false),
    [studioMembers, setStudioMembers] = useState<any[]>([]),
    [transferTargetId, setTransferTargetId] = useState(""),
    [transferring, setTransferring] = useState(false),
    [studioShelf, setStudioShelf] = useState<any[]>([]),
    [firings, setFirings] = useState<any[]>([]),
    [recipe, setRecipe] = useState(""),
    [firingDate, setFiringDate] = useState(
      new Date().toISOString().slice(0, 10),
    ),
    [glazedDate, setGlazedDate] = useState(
      new Date().toISOString().slice(0, 10),
    ),
    [completingFiringId, setCompletingFiringId] = useState(""),
    [editingHadResult, setEditingHadResult] = useState(false),
    [firingSchedule, setFiringSchedule] = useState("Standard / medium"),
    [firingOrientation, setFiringOrientation] = useState("vertical"),
    [movement, setMovement] = useState(""),
    [travelDistance, setTravelDistance] = useState(""),
    [colorResult, setColorResult] = useState(""),
    [surfaceResult, setSurfaceResult] = useState(""),
    [defects, setDefects] = useState(""),
    [firingNotes, setFiringNotes] = useState(""),
    [rating, setRating] = useState(5),
    [beforePhoto, setBeforePhoto] = useState<File[]>([]),
    [photo, setPhoto] = useState<File[]>([]),
    [preview, setPreview] = useState(""),
    [firingDetail, setFiringDetail] = useState<any>(null),
    [firingDetailPhotos, setFiringDetailPhotos] = useState<any[]>([]),
    [firingComments, setFiringComments] = useState<any[]>([]),
    [newComment, setNewComment] = useState(""),
    [commentPosting, setCommentPosting] = useState(false),
    [firingDetailLoading, setFiringDetailLoading] = useState(false),
    [firingSaving, setFiringSaving] = useState(false),
    [journalFormOpen, setJournalFormOpen] = useState(false),
    [homeStudioManagerOpen, setHomeStudioManagerOpen] = useState(false),
    [sharingFiringId, setSharingFiringId] = useState(""),
    [exploreResults, setExploreResults] = useState<any[]>([]),
    [exploreLoading, setExploreLoading] = useState(false),
    [exploreStarted, setExploreStarted] = useState(false),
    [exploreQuery, setExploreQuery] = useState(""),
    [exploreEffect, setExploreEffect] = useState(""),
    [exploreCone, setExploreCone] = useState(""),
    [exploreRating, setExploreRating] = useState("");
  const [glazeDetail, setGlazeDetail] = useState<any>(null),
    [glazeDetailLoading, setGlazeDetailLoading] = useState(false),
    [glazeDetailScroll, setGlazeDetailScroll] = useState(0),
    [addingShelfKey, setAddingShelfKey] = useState("");
  const [materialDetail, setMaterialDetail] = useState<any>(null),
    [materialDetailScroll, setMaterialDetailScroll] = useState(0);
  const [effectSearch, setEffectSearch] = useState(""),
    [colorSearch, setColorSearch] = useState(""),
    [searchScope, setSearchScope] = useState("all"),
    [finderCone, setFinderCone] = useState(""),
    [searchStarted, setSearchStarted] = useState(false),
    [searching, setSearching] = useState(false),
    [hasMoreResults, setHasMoreResults] = useState(false),
    [lastSearchQuick, setLastSearchQuick] = useState(false);
  const [showLoginSpin, setShowLoginSpin] = useState(false);
  const [shelfQuery, setShelfQuery] = useState(""),
    [shelfSort, setShelfSort] = useState("name"),
    [shelfTypeFilter, setShelfTypeFilter] = useState("all"),
    [shelfBrandFilter, setShelfBrandFilter] = useState("all"),
    [shelfConeFilter, setShelfConeFilter] = useState("all"),
    [shelfStockFilter, setShelfStockFilter] = useState("all"),
    [inventoryItem, setInventoryItem] = useState<any>(null),
    [inventoryLocation, setInventoryLocation] = useState<"mine" | "studio">("mine"),
    [inventoryStatus, setInventoryStatus] = useState("owned"),
    [inventoryQuantity, setInventoryQuantity] = useState(""),
    [inventoryContainer, setInventoryContainer] = useState(""),
    [inventoryNotes, setInventoryNotes] = useState(""),
    [inventorySaving, setInventorySaving] = useState(false);
  const [profileName, setProfileName] = useState(""),
    [accountEmail, setAccountEmail] = useState(""),
    [accountPassword, setAccountPassword] = useState(""),
    [accountPasswordConfirm, setAccountPasswordConfirm] = useState(""),
    [profilePhoto, setProfilePhoto] = useState<File | null>(null),
    [cropSrc, setCropSrc] = useState(""),
    [cropNatural, setCropNatural] = useState({ w: 0, h: 0 }),
    [cropZoom, setCropZoom] = useState(1),
    [cropOffset, setCropOffset] = useState({ x: 0, y: 0 }),
    [cropTarget, setCropTarget] = useState<"profile" | "studio">("profile"),
    [studioPhotoUploading, setStudioPhotoUploading] = useState(false),
    [profilePreview, setProfilePreview] = useState(""),
    [profileDefaultCone, setProfileDefaultCone] = useState("6"),
    [profileStudio, setProfileStudio] = useState(""),
    [accountSaving, setAccountSaving] = useState(false),
    [showDeleteAccount, setShowDeleteAccount] = useState(false),
    [deleteAccountPassword, setDeleteAccountPassword] = useState(""),
    [deleteAccountConfirmation, setDeleteAccountConfirmation] = useState(""),
    [deletingAccount, setDeletingAccount] = useState(false);
  const cropDragRef = useRef<{
    dragging: boolean;
    startX: number;
    startY: number;
    startOffsetX: number;
    startOffsetY: number;
  }>({ dragging: false, startX: 0, startY: 0, startOffsetX: 0, startOffsetY: 0 });
  function setTab(nextScreen: AppScreen) {
    setTabState(nextScreen);
    const nextPath = pathForScreen(nextScreen);
    if (pathname !== nextPath) {
      window.history.pushState({}, "", nextPath);
      window.requestAnimationFrame(() => window.scrollTo(0, 0));
    }
  }
  function smartMatch(haystack: string, query: string) {
    const q = (query || "").trim().toLowerCase();
    if (!q) return true;
    const hWords = String(haystack || "")
      .toLowerCase()
      .replace(/[-_/]+/g, " ")
      .split(" ")
      .filter(Boolean);
    const qWords = q.replace(/[-_/]+/g, " ").split(" ").filter(Boolean);
    const matchesSomeSuffix = (term: string) => {
      for (let i = 0; i < hWords.length; i++) {
        if (hWords.slice(i).join("").startsWith(term)) return true;
      }
      return false;
    };
    return qWords.every((w) => matchesSomeSuffix(w));
  }
  function togglePasswordField(key: string) {
    setVisiblePasswordFields((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }
  function renderPasswordToggle(fieldKey: string) {
    const visible = visiblePasswordFields.has(fieldKey);
    return (
      <button
        type="button"
        className="password-toggle"
        aria-label={visible ? "Hide password" : "Show password"}
        onClick={() => togglePasswordField(fieldKey)}
      >
        {visible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    );
  }
  function decodeApplication(value: any) {
    const raw = String(value || "overall").toLowerCase();
    if (raw.includes("::")) {
      const [surface, placement] = raw.split("::");
      return {
        surface: surface || "inside & outside",
        placement: placement || "overall",
      };
    }
    if (raw === "inside" || raw === "outside")
      return { surface: raw, placement: "overall" };
    return { surface: "inside & outside", placement: raw };
  }
  function encodeApplication(layer: any) {
    return `${layer.surface || "inside & outside"}::${layer.placement || "overall"}`;
  }
  function titleCase(value: string) {
    return value.replace(/\b\w/g, (c) => c.toUpperCase());
  }
  function resultItemId(x: any) {
    return x.item_id || x.glaze_id || x.clay_id || x.material_id || x.id;
  }
  function resultItemType(x: any) {
    return x.item_type || (x.clay_id ? "clay" : x.material_id ? "underglaze" : "glaze");
  }
  function resultKey(x: any) {
    return `${resultItemType(x)}:${resultItemId(x)}`;
  }
  function personalShelfRow(x: any) {
    const key = resultKey(x);
    return shelf.find((item) => `${item.item_type}:${item.item_id}` === key);
  }
  function studioShelfRow(x: any) {
    const key = resultKey(x);
    return studioShelf.find(
      (item) => `${item.item_type}:${item.item_id}` === key,
    );
  }
  function isOnMyShelf(x: any) {
    const item = personalShelfRow(x);
    return (
      item?.status === "owned" ||
      item?.status === "low" ||
      (!item && (x.access_state === "Mine" || x.access_state === "Mine + Studio"))
    );
  }
  function isWishlisted(x: any) {
    return personalShelfRow(x)?.status === "wishlist";
  }
  function isOnStudioShelf(x: any) {
    const item = studioShelfRow(x);
    return (
      item?.status === "available" ||
      item?.status === "low" ||
      (!item &&
        (x.access_state === "Studio" || x.access_state === "Mine + Studio"))
    );
  }
  function accessLabel(x: any) {
    const mine = isOnMyShelf(x),
      inStudio = isOnStudioShelf(x);
    if (mine && inStudio) return "My + Studio";
    if (mine) return "My Shelf";
    if (isWishlisted(x)) return "Want to Try";
    if (inStudio) return "Studio Shelf";
    return resultItemType(x) === "clay"
      ? "All Clay"
      : resultItemType(x) === "underglaze"
        ? "All Underglazes"
        : "All Glazes";
  }
  function updateResultAccess(x: any, destination: "mine" | "studio") {
    const key = resultKey(x);
    setResults((current) =>
      current.map((item) => {
        if (resultKey(item) !== key) return item;
        const onMine = destination === "mine" || isOnMyShelf(item);
        const onStudio = destination === "studio" || isOnStudioShelf(item);
        return {
          ...item,
          access_state:
            onMine && onStudio
              ? "Mine + Studio"
              : onMine
                ? "Mine"
                : onStudio
                  ? "Studio"
                  : "All",
        };
      }),
    );
  }
  function usesCustomPlacement(layer: any) {
    return (
      layer.placementMode === "custom" ||
      !placementOptions.includes(layer.placement || "overall")
    );
  }
  useEffect(() => {
    sb.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = sb.auth.onAuthStateChange((event, s) => {
      setSession(s);
      if (event === "PASSWORD_RECOVERY") {
        setRecovery(true);
        setMsg("");
      }
    });
    return () => data.subscription.unsubscribe();
  }, [sb]);
  useEffect(() => {
    const routeScreen = screenForPath(pathname);
    setTabState(routeScreen);
  }, [pathname]);
  useEffect(() => {
    setFiringDetail(null);
    setMaterialDetail(null);
    setGlazeDetail(null);
    setRecipeDetail([]);
    setInventoryItem(null);
    setStudioRecipesOpen(false);
    setCompletingFiringId("");
    setEditingHadResult(false);
  }, [tab]);
  useEffect(() => {
    if (session) {
      setMsg("");
      setProfileName(
        session.user.user_metadata?.display_name ||
          session.user.user_metadata?.full_name ||
          "",
      );
      setAccountEmail(session.user.email || "");
      setProfilePreview(session.user.user_metadata?.avatar_url || "");
      setProfileDefaultCone(
        String(session.user.user_metadata?.default_cone || 6),
      );
      setProfileStudio(
        session.user.user_metadata?.preferred_studio_id || "",
      );
      load();
    }
  }, [session]);
  useEffect(() => {
    if (!showLoginSpin) return;
    const timer = window.setTimeout(() => setShowLoginSpin(false), 1400);
    return () => window.clearTimeout(timer);
  }, [showLoginSpin]);
  useEffect(() => {
    if (tab !== "find" || !msg.includes("✓")) return;
    const timer = window.setTimeout(() => setMsg(""), 2800);
    return () => window.clearTimeout(timer);
  }, [msg, tab]);
  function materialManufacturer(material: any) {
    const joined = material?.manufacturer;
    if (Array.isArray(joined)) return joined[0]?.name || "";
    return joined?.name || joined || "";
  }
  function displayMaterialSku(value: any) {
    const sku = String(value || "");
    return sku.toLowerCase().startsWith("sku not surfaced") ? "" : sku;
  }
  function normalizeMaterialInventory(row: any) {
    const material = row.material || {};
    return {
      item_type: "underglaze",
      item_id: material.id || row.material_id,
      item_name: material.name || "Underglaze",
      manufacturer: materialManufacturer(material),
      sku_or_code: displayMaterialSku(material.sku),
      cone_min: material.cone_min,
      cone_max: material.cone_max,
      firing_range: material.firing_range,
      finish: material.finish,
      opacity: material.opacity,
      status: row.status,
      quantity: row.quantity,
      container_size: row.container_size,
      notes: row.notes,
      updated_at: row.updated_at,
    };
  }
  async function load(preferredStudioId = "") {
    const [a, b, c, d, materials] = await Promise.all([
      sb.rpc("get_my_shelf_v2"),
      sb.rpc("get_my_recipes_v2"),
      sb.rpc("get_my_studios"),
      sb.rpc("get_my_firings_v2"),
      sb
        .from("user_material_inventory")
        .select("status,quantity,container_size,notes,updated_at,material:materials(id,name,sku,cone_min,cone_max,firing_range,finish,opacity,manufacturer:manufacturers(name))")
        .eq("user_id", session.user.id),
    ]);
    setShelf([...(a.data ?? []), ...(materials.data ?? []).map(normalizeMaterialInventory)]);
    setRecipes(b.data ?? []);
    setFirings(d.data ?? []);
    const studioRows = c.data ?? [];
    const savedStudioId =
      session?.user?.user_metadata?.preferred_studio_id || "";
    const selectedStudioId =
      preferredStudioId ||
      (studioRows.some((s: any) => s.studio_id === savedStudioId)
        ? savedStudioId
        : "") ||
      (studioRows.some((s: any) => s.studio_id === studio)
        ? studio
        : (studioRows.find((s: any) => s.is_default) || studioRows[0])
            ?.studio_id) ||
      "";
    setStudios(studioRows);
    setStudio(selectedStudioId);
    setProfileStudio((current) => current || selectedStudioId);
    let studioError: any = null;
    if (selectedStudioId) {
      const [e, materialRows] = await Promise.all([
        sb.rpc("get_studio_shelf_v2", { p_studio_id: selectedStudioId }),
        sb
          .from("studio_material_inventory")
          .select("status,quantity,container_size,notes,updated_at,material:materials(id,name,sku,cone_min,cone_max,firing_range,finish,opacity,manufacturer:manufacturers(name))")
          .eq("studio_id", selectedStudioId),
      ]);
      studioError = e.error || materialRows.error;
      setStudioShelf([...(e.data ?? []), ...(materialRows.data ?? []).map(normalizeMaterialInventory)]);
    } else setStudioShelf([]);
    const error = a.error || b.error || c.error || d.error || materials.error || studioError;
    if (error) setMsg(error.message);
  }
  async function auth(signup = false) {
    if (!email.trim() || !password) {
      return setMsg("Enter your email and password.");
    }
    if (signup) {
      if (password.length < 8) {
        return setMsg("Your password must be at least 8 characters.");
      }
      if (password !== signupConfirmPassword) {
        return setMsg("Passwords don't match.");
      }
    }
    const r = signup
      ? await sb.auth.signUp({ email: email.trim(), password })
      : await sb.auth.signInWithPassword({ email: email.trim(), password });
    if (r.error) setMsg(r.error.message);
    else if (signup) {
      setAuthMode("signin");
      setPassword("");
      setSignupConfirmPassword("");
      setMsg("Account created. Check email if required.");
    } else setShowLoginSpin(true);
  }
  async function forgotPassword() {
    if (!email.trim()) return setMsg("Enter your email address first.");
    const r = await sb.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: window.location.origin,
    });
    setMsg(
      r.error ? r.error.message : "Check your email for a password reset link.",
    );
  }
  async function saveNewPassword() {
    if (newPassword.length < 8)
      return setMsg("Your new password must be at least 8 characters.");
    if (newPassword !== confirmPassword)
      return setMsg("The two passwords do not match.");
    const r = await sb.auth.updateUser({ password: newPassword });
    if (r.error) setMsg(r.error.message);
    else {
      setNewPassword("");
      setConfirmPassword("");
      setRecovery(false);
      window.history.replaceState({}, document.title, window.location.pathname);
      setMsg("Password updated ✓");
    }
  }
  async function saveAccountProfile() {
    const nextName = profileName.trim();
    const nextEmail = accountEmail.trim().toLowerCase();
    if (!nextName) return setMsg("Enter your name first.");
    if (!nextEmail) return setMsg("Enter a valid email address.");
    const emailChanged =
      nextEmail !== String(session.user.email || "").toLowerCase();
    setAccountSaving(true);
    let avatarUrl = session.user.user_metadata?.avatar_url || "";
    if (profilePhoto) {
      if (profilePhoto.size > 5 * 1024 * 1024) {
        setAccountSaving(false);
        return setMsg("Choose a profile picture smaller than 5 MB.");
      }
      let optimizedPhoto: File;
      try {
        optimizedPhoto = await optimizeImageFile(profilePhoto, 1024, 0.84);
      } catch (error: any) {
        setAccountSaving(false);
        return setMsg(error?.message || "This profile picture could not be prepared.");
      }
      const extension = optimizedPhoto.type === "image/webp" ? ".webp" : "";
      const path = `${session.user.id}/avatar${extension}`;
      const upload = await sb.storage
        .from("profile-photos")
        .upload(path, optimizedPhoto, {
          upsert: true,
          contentType: optimizedPhoto.type,
          cacheControl: "31536000",
        });
      if (upload.error) {
        setAccountSaving(false);
        return setMsg(upload.error.message);
      }
      const publicPhoto = sb.storage.from("profile-photos").getPublicUrl(path);
      avatarUrl = `${publicPhoto.data.publicUrl}?v=${Date.now()}`;
      const existing = await sb.storage
        .from("profile-photos")
        .list(session.user.id, { limit: 100 });
      if (!existing.error) {
        const oldPaths = (existing.data ?? [])
          .map((item: any) => `${session.user.id}/${item.name}`)
          .filter((itemPath: string) => itemPath !== path);
        if (oldPaths.length) await sb.storage.from("profile-photos").remove(oldPaths);
      }
    }
    const updates: any = {
      data: {
        ...session.user.user_metadata,
        display_name: nextName,
        avatar_url: avatarUrl,
        default_cone: Number(profileDefaultCone),
        preferred_studio_id: profileStudio || null,
      },
    };
    if (emailChanged) updates.email = nextEmail;
    const r = await sb.auth.updateUser(updates);
    setAccountSaving(false);
    if (r.error) return setMsg(r.error.message);
    setProfilePhoto(null);
    setProfilePreview(avatarUrl);
    setCone(Number(profileDefaultCone));
    if (profileStudio) setStudio(profileStudio);
    setMsg(
      emailChanged
        ? "Name saved. Check your old and new email inboxes to confirm the email change."
        : "Account details saved ✓",
    );
  }
  async function changeAccountPassword() {
    if (accountPassword.length < 8)
      return setMsg("Your new password must be at least 8 characters.");
    if (accountPassword !== accountPasswordConfirm)
      return setMsg("The two passwords do not match.");
    const r = await sb.auth.updateUser({ password: accountPassword });
    if (r.error) return setMsg(r.error.message);
    setAccountPassword("");
    setAccountPasswordConfirm("");
    setMsg("Password updated ✓");
  }
  async function removeProfilePhoto() {
    setAccountSaving(true);
    const existing = await sb.storage
      .from("profile-photos")
      .list(session.user.id, { limit: 100 });
    if (existing.error) {
      setAccountSaving(false);
      return setMsg(existing.error.message);
    }
    const paths = (existing.data ?? []).map(
      (item: any) => `${session.user.id}/${item.name}`,
    );
    if (paths.length) {
      const removed = await sb.storage.from("profile-photos").remove(paths);
      if (removed.error) {
        setAccountSaving(false);
        return setMsg(removed.error.message);
      }
    }
    const updated = await sb.auth.updateUser({
      data: {
        ...session.user.user_metadata,
        avatar_url: "",
      },
    });
    setAccountSaving(false);
    if (updated.error) return setMsg(updated.error.message);
    if (profilePreview.startsWith("blob:")) URL.revokeObjectURL(profilePreview);
    setProfilePhoto(null);
    setProfilePreview("");
    setMsg("Profile picture removed ✓");
  }
  async function deleteAccount() {
    if (!deleteAccountPassword)
      return setMsg("Enter your password to continue.");
    if (deleteAccountConfirmation.trim() !== "DELETE")
      return setMsg('Type DELETE exactly to confirm.');
    setDeletingAccount(true);
    setMsg("");
    const verified = await sb.auth.signInWithPassword({
      email: session.user.email || "",
      password: deleteAccountPassword,
    });
    if (verified.error) {
      setDeletingAccount(false);
      return setMsg("That password is not correct. Your account was not deleted.");
    }
    const deleted = await sb.functions.invoke("delete-account", {
      body: { confirmation: "DELETE" },
    });
    if (deleted.error) {
      setDeletingAccount(false);
      return setMsg("Your account could not be deleted. Please try again.");
    }
    await sb.auth.signOut({ scope: "local" });
    window.location.reload();
  }
  function chooseProfilePhoto(file?: File) {
    if (!file) return;
    const allowed = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/heic",
      "image/heif",
    ];
    if (!allowed.includes(file.type))
      return setMsg("Choose a JPG, PNG, WebP, or HEIC image.");
    if (file.size > 5 * 1024 * 1024)
      return setMsg("Choose a profile picture smaller than 5 MB.");
    if (cropSrc) URL.revokeObjectURL(cropSrc);
    setCropTarget("profile");
    setCropZoom(1);
    setCropOffset({ x: 0, y: 0 });
    setCropSrc(URL.createObjectURL(file));
    setMsg("");
  }
  function chooseStudioPhoto(file?: File) {
    if (!file) return;
    if (!currentStudio) return setMsg("Join or create a studio first.");
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];
    if (!allowed.includes(file.type))
      return setMsg("Choose a JPG, PNG, WebP, or HEIC image.");
    if (file.size > 5 * 1024 * 1024)
      return setMsg("Choose a studio photo smaller than 5 MB.");
    if (cropSrc) URL.revokeObjectURL(cropSrc);
    setCropTarget("studio");
    setCropZoom(1);
    setCropOffset({ x: 0, y: 0 });
    setCropSrc(URL.createObjectURL(file));
    setMsg("");
  }
  function cropBounds(zoom: number, natural: { w: number; h: number }) {
    const VP = 280;
    if (!natural.w || !natural.h) return { x: 0, y: 0 };
    const baseScale = Math.max(VP / natural.w, VP / natural.h);
    const scale = baseScale * zoom;
    const x = Math.max(0, (natural.w * scale - VP) / 2);
    const y = Math.max(0, (natural.h * scale - VP) / 2);
    return { x, y };
  }
  function clampCropOffset(
    offset: { x: number; y: number },
    zoom: number,
    natural: { w: number; h: number },
  ) {
    const bounds = cropBounds(zoom, natural);
    return {
      x: Math.min(bounds.x, Math.max(-bounds.x, offset.x)),
      y: Math.min(bounds.y, Math.max(-bounds.y, offset.y)),
    };
  }
  function onCropPointerDown(e: any) {
    (e.target as Element).setPointerCapture(e.pointerId);
    cropDragRef.current = {
      dragging: true,
      startX: e.clientX,
      startY: e.clientY,
      startOffsetX: cropOffset.x,
      startOffsetY: cropOffset.y,
    };
  }
  function onCropPointerMove(e: any) {
    if (!cropDragRef.current.dragging) return;
    const dx = e.clientX - cropDragRef.current.startX;
    const dy = e.clientY - cropDragRef.current.startY;
    setCropOffset(
      clampCropOffset(
        {
          x: cropDragRef.current.startOffsetX + dx,
          y: cropDragRef.current.startOffsetY + dy,
        },
        cropZoom,
        cropNatural,
      ),
    );
  }
  function onCropPointerUp() {
    cropDragRef.current.dragging = false;
  }
  function onCropZoomChange(nextZoom: number) {
    setCropZoom(nextZoom);
    setCropOffset((prev) => clampCropOffset(prev, nextZoom, cropNatural));
  }
  function cancelCrop() {
    if (cropSrc) URL.revokeObjectURL(cropSrc);
    setCropSrc("");
    setCropNatural({ w: 0, h: 0 });
    setCropZoom(1);
    setCropOffset({ x: 0, y: 0 });
  }
  function confirmCrop() {
    if (!cropSrc || !cropNatural.w) return;
    const VP = 280;
    const OUT = 512;
    const baseScale = Math.max(VP / cropNatural.w, VP / cropNatural.h);
    const scale = baseScale * cropZoom;
    const sSize = VP / scale;
    const centerImgX = cropNatural.w / 2 - cropOffset.x / scale;
    const centerImgY = cropNatural.h / 2 - cropOffset.y / scale;
    const sourceX = centerImgX - sSize / 2;
    const sourceY = centerImgY - sSize / 2;
    const canvas = document.createElement("canvas");
    canvas.width = OUT;
    canvas.height = OUT;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      if (!ctx) return;
      ctx.drawImage(img, sourceX, sourceY, sSize, sSize, 0, 0, OUT, OUT);
      canvas.toBlob(
        async (blob) => {
          if (!blob) return;
          if (cropTarget === "studio" && currentStudio) {
            setStudioPhotoUploading(true);
            const path = `studio/${currentStudio.studio_id}/logo.jpg`;
            const up = await sb.storage
              .from("profile-photos")
              .upload(path, blob, { upsert: true, contentType: "image/jpeg" });
            if (up.error) {
              setStudioPhotoUploading(false);
              cancelCrop();
              return setMsg(up.error.message);
            }
            const pub = sb.storage.from("profile-photos").getPublicUrl(path);
            const r = await sb.rpc("update_studio_photo", {
              p_studio_id: currentStudio.studio_id,
              p_photo_url: `${pub.data.publicUrl}?v=${Date.now()}`,
            });
            setStudioPhotoUploading(false);
            cancelCrop();
            if (r.error) return setMsg(r.error.message);
            setMsg("Studio photo updated ✓");
            return await load();
          }
          const cropped = new File([blob], "profile-photo.jpg", {
            type: "image/jpeg",
            lastModified: Date.now(),
          });
          if (profilePreview.startsWith("blob:"))
            URL.revokeObjectURL(profilePreview);
          setProfilePhoto(cropped);
          setProfilePreview(URL.createObjectURL(cropped));
          cancelCrop();
        },
        "image/jpeg",
        0.9,
      );
    };
    img.src = cropSrc;
  }
  async function search(quick = false, append = false) {
    setSearching(true);
    setSearchStarted(true);
    if (!append) setLastSearchQuick(quick);
    const effectiveQuick = append ? lastSearchQuick : quick;
    const offset = append ? results.length : 0;
    let r: any;
    if (kind === "underglaze") {
      r = await sb.rpc("search_materials_paged", {
        p_query: q.trim() || null,
        p_material_type: "underglaze",
        p_user_id: session.user.id,
        p_studio_id: studio || null,
        p_access: searchScope,
        p_limit: FINDER_PAGE_SIZE,
        p_offset: offset,
      });
    } else r =
      kind === "glaze"
        ? await sb.rpc("find_glazes_paged", {
            p_query: q.trim() || null,
            p_cone: effectiveQuick ? null : finderCone ? Number(finderCone) : null,
            p_color_family: effectiveQuick ? null : colorSearch || null,
            p_effect: effectiveQuick ? null : effectSearch.trim() || null,
            p_user_id: session.user.id,
            p_studio_id: studio || null,
            p_access: searchScope,
            p_limit: FINDER_PAGE_SIZE,
            p_offset: offset,
          })
        : await sb.rpc("search_clays_paged", {
            p_query: q.trim() || null,
            p_cone: null,
            p_limit: FINDER_PAGE_SIZE,
            p_offset: offset,
          });
    setSearching(false);
    if (r.error) setMsg(r.error.message);
    else {
      setMsg("");
      const incoming = r.data ?? [];
      setHasMoreResults(incoming.length === FINDER_PAGE_SIZE);
      setResults((current) => {
        if (!append) return incoming;
        const seen = new Set(current.map(resultKey));
        return [...current, ...incoming.filter((item: any) => !seen.has(resultKey(item)))];
      });
    }
  }
  function openFinder(scope = "all", fromBuilder = false) {
    setKind("glaze");
    setQ("");
    setEffectSearch("");
    setColorSearch("");
    setSearchScope(scope);
    setFinderCone(fromBuilder ? String(cone) : "");
    setResults([]);
    setHasMoreResults(false);
    setSearchStarted(false);
    setMsg("");
    setTab("find");
    window.requestAnimationFrame(() => window.scrollTo(0, 0));
  }
  function clearFinderSearch() {
    setQ("");
    setEffectSearch("");
    setColorSearch("");
    setFinderCone("");
    setResults([]);
    setHasMoreResults(false);
    setSearchStarted(false);
    setMsg("");
    window.requestAnimationFrame(() =>
      document.getElementById("quick-glaze-query")?.focus(),
    );
  }
  function openClayFinder() {
    setKind("clay");
    setQ("");
    setEffectSearch("");
    setColorSearch("");
    setFinderCone("");
    setSearchScope("all");
    setResults([]);
    setHasMoreResults(false);
    setSearchStarted(false);
    setMsg("");
    setTab("find");
    window.requestAnimationFrame(() => window.scrollTo(0, 0));
  }
  function openUnderglazeFinder(scope = "all") {
    setKind("underglaze");
    setQ("");
    setEffectSearch("");
    setColorSearch("");
    setFinderCone("");
    setSearchScope(scope);
    setResults([]);
    setHasMoreResults(false);
    setSearchStarted(false);
    setMsg("");
    setTab("find");
    window.requestAnimationFrame(() => window.scrollTo(0, 0));
  }
  async function createStudio() {
    const r = await sb.rpc("create_my_studio", {
      p_name: studioName,
      p_location_label: null,
      p_visibility: "private",
    });
    if (r.error) setMsg(r.error.message);
    else {
      setStudioName("");
      setMsg("Studio created ✓");
      await load(r.data);
      setHomeStudioManagerOpen(false);
    }
  }
  async function joinStudio() {
    setJoinMsg("");
    if (!join.trim()) return setJoinMsg("Enter an invite code first.");
    const r = await sb.rpc("join_studio_by_code", { p_code: join });
    if (r.error) return setJoinMsg(r.error.message);
    else {
      setJoin("");
      setJoinMsg("Studio joined ✓");
      setTimeout(() => setJoinMsg(""), 5000);
      await load(r.data);
    }
  }
  async function openStudio(id: string) {
    setStudio(id);
    setTab("studio");
    const r = await sb.rpc("get_studio_shelf_v2", { p_studio_id: id });
    if (r.error) setMsg(r.error.message);
    else setStudioShelf(r.data ?? []);
  }
  async function chooseHomeStudio(id: string) {
    setStudio(id);
    setProfileStudio(id);
    setHomeStudioManagerOpen(false);
    await sb.auth.updateUser({
      data: {
        ...session.user.user_metadata,
        preferred_studio_id: id,
      },
    });
    await load(id);
  }
  async function invite(id: string) {
    if (currentStudio?.join_code) {
      setInviteCodeShown(currentStudio.join_code);
      return;
    }
    const r = await sb.rpc("regenerate_studio_join_code", { p_studio_id: id });
    if (r.error) return setMsg(r.error.message);
    setInviteCodeShown(r.data || "");
    await load();
  }
  async function copyInviteCode() {
    try {
      await navigator.clipboard.writeText(inviteCodeShown);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    } catch {
      setMsg("Could not copy — select and copy the code manually.");
    }
  }
  async function saveCustomInviteCode(studioId: string) {
    const r = await sb.rpc("set_studio_join_code", {
      p_studio_id: studioId,
      p_code: customCodeInput,
    });
    if (r.error) return setMsg(r.error.message);
    setInviteCodeShown(r.data || "");
    setEditingInviteCode(false);
    setCustomCodeInput("");
    await load();
  }
  async function openTransferPanel(studioId: string) {
    setShowTransferPanel(true);
    setTransferTargetId("");
    const r = await sb.rpc("get_studio_members", { p_studio_id: studioId });
    if (r.error) return setMsg(r.error.message);
    setStudioMembers((r.data ?? []).filter((m: any) => !m.is_owner));
  }
  async function transferOwnership(studioId: string) {
    if (!transferTargetId) return;
    setTransferring(true);
    const r = await sb.rpc("transfer_studio_ownership", {
      p_studio_id: studioId,
      p_new_owner_user_id: transferTargetId,
    });
    setTransferring(false);
    if (r.error) return setMsg(r.error.message);
    setMsg("Studio ownership transferred ✓");
    setShowTransferPanel(false);
    await load();
  }
  async function deleteStudio(studioId: string, studioName: string) {
    if (deleteStudioConfirmText !== studioName) return;
    setDeletingStudio(true);
    const r = await sb.from("studios").delete().eq("id", studioId);
    setDeletingStudio(false);
    if (r.error) return setMsg(r.error.message);
    setShowDeleteStudioPanel(false);
    setDeleteStudioConfirmText("");
    if (studio === studioId) setStudio("");
    setMsg("Studio deleted ✓");
    setHomeStudioManagerOpen(false);
    await load();
  }
  async function studioAdd(x: any) {
    if (!studio) return setMsg("Open a studio first.");
    if (isOnStudioShelf(x)) return;
    const saveKey = `${resultKey(x)}:studio`;
    if (addingShelfKey) return;
    setAddingShelfKey(saveKey);
    const itemType = resultItemType(x);
    const r =
      itemType === "underglaze"
        ? await sb.from("studio_material_inventory").upsert(
            {
              studio_id: studio,
              material_id: resultItemId(x),
              status: "available",
              updated_at: new Date().toISOString(),
            },
            { onConflict: "studio_id,material_id" },
          )
        : itemType === "glaze"
        ? await sb.rpc("set_studio_glaze", {
            p_studio_id: studio,
            p_glaze_id: x.glaze_id || x.item_id,
            p_status: "available",
            p_notes: null,
          })
        : await sb.rpc("set_studio_clay", {
            p_studio_id: studio,
            p_clay_id: x.clay_id || x.item_id,
            p_status: "available",
            p_notes: null,
          });
    if (r.error) setMsg(r.error.message);
    else {
      updateResultAccess(x, "studio");
      setMsg(
        `Added ${x.glaze_name || x.clay_name || x.material_name || x.name || "item"} to Studio Shelf ✓`,
      );
      await load(studio);
    }
    setAddingShelfKey("");
  }
  async function mine(x: any) {
    if (isOnMyShelf(x)) return;
    const saveKey = `${resultKey(x)}:mine`;
    if (addingShelfKey) return;
    setAddingShelfKey(saveKey);
    const itemType = resultItemType(x);
    const r =
      itemType === "underglaze"
        ? await sb.from("user_material_inventory").upsert(
            {
              user_id: session.user.id,
              material_id: resultItemId(x),
              status: "owned",
              updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id,material_id" },
          )
        : itemType === "glaze"
        ? await sb.rpc("set_my_glaze", {
            p_glaze_id: x.glaze_id || x.item_id,
            p_status: "owned",
            p_quantity: null,
            p_notes: null,
          })
        : await sb.rpc("set_my_clay", {
            p_clay_id: x.clay_id || x.item_id,
            p_status: "owned",
            p_notes: null,
          });
    if (r.error) setMsg(r.error.message);
    else {
      updateResultAccess(x, "mine");
      setMsg(`Added ${x.glaze_name || x.clay_name || x.material_name || x.name || "item"} to My Shelf ✓`);
      await load();
    }
    setAddingShelfKey("");
  }
  async function wantToTry(x: any) {
    if (kind !== "glaze" || isOnMyShelf(x) || isWishlisted(x)) return;
    const saveKey = `${resultKey(x)}:wishlist`;
    if (addingShelfKey) return;
    setAddingShelfKey(saveKey);
    const r = await sb.rpc("set_my_glaze", {
      p_glaze_id: x.glaze_id || x.item_id,
      p_status: "wishlist",
      p_quantity: null,
      p_notes: null,
    });
    if (r.error) setMsg(r.error.message);
    else {
      setMsg(`Saved ${x.glaze_name || x.item_name || "glaze"} to Want to Try ✓`);
      await load();
    }
    setAddingShelfKey("");
  }
  function openInventoryEditor(x: any, location: "mine" | "studio") {
    const row = location === "mine" ? personalShelfRow(x) : studioShelfRow(x);
    setInventoryItem(x);
    setInventoryLocation(location);
    setInventoryStatus(
      row?.status || (location === "mine" ? "owned" : "available"),
    );
    setInventoryQuantity(row?.quantity == null ? "" : String(row.quantity));
    setInventoryContainer(row?.container_size || "");
    setInventoryNotes(row?.notes || "");
    setMsg("");
  }
  async function saveInventory() {
    if (!inventoryItem) return;
    const quantity = inventoryQuantity.trim() === "" ? null : Number(inventoryQuantity);
    if (quantity != null && (!Number.isFinite(quantity) || quantity < 0)) {
      return setMsg("Quantity must be zero or more.");
    }
    setInventorySaving(true);
    const itemType = resultItemType(inventoryItem);
    const itemId = resultItemId(inventoryItem);
    const r =
      itemType === "underglaze" && inventoryLocation === "mine"
        ? await sb
            .from("user_material_inventory")
            .update({
              status: inventoryStatus,
              quantity,
              container_size: inventoryContainer.trim() || null,
              notes: inventoryNotes.trim() || null,
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", session.user.id)
            .eq("material_id", itemId)
        : itemType === "underglaze"
          ? await sb
              .from("studio_material_inventory")
              .update({
                status: inventoryStatus,
                quantity,
                container_size: inventoryContainer.trim() || null,
                notes: inventoryNotes.trim() || null,
                updated_at: new Date().toISOString(),
              })
              .eq("studio_id", studio)
              .eq("material_id", itemId)
          : inventoryLocation === "mine"
        ? await sb.rpc("update_my_inventory_item", {
            p_item_type: itemType,
            p_item_id: itemId,
            p_status: inventoryStatus,
            p_quantity: quantity,
            p_container_size: inventoryContainer.trim() || null,
            p_notes: inventoryNotes.trim() || null,
          })
        : await sb.rpc("update_studio_inventory_item", {
            p_studio_id: studio,
            p_item_type: itemType,
            p_item_id: itemId,
            p_status: inventoryStatus,
            p_quantity: quantity,
            p_container_size: inventoryContainer.trim() || null,
            p_notes: inventoryNotes.trim() || null,
          });
    setInventorySaving(false);
    if (r.error) return setMsg(r.error.message);
    setInventoryItem(null);
    setMsg("Inventory updated ✓");
    await load();
  }
  function addShelfGlazeToBuild(x: any) {
    const glazeName = x.item_name || x.glaze_name || x.name,
      manufacturer =
        typeof x.manufacturer === "string"
          ? x.manufacturer
          : x.manufacturer?.name;
    setLayers([
      ...layers,
      {
        glaze_id: x.item_id || x.glaze_id || x.id,
        glaze_name: glazeName,
        manufacturer,
        coats: 2,
        surface: "inside & outside",
        placement: "overall",
        placementMode: "preset",
      },
    ]);
    setAnalysis(null);
    setGlazeDetail(null);
    setMsg(`${glazeName} added to your build ✓`);
    setTab("build");
  }
  async function openGlazeDetail(x: any) {
    const glazeId = x.item_id || x.glaze_id || x.id,
      glazeName = x.item_name || x.glaze_name || x.name,
      manufacturer =
        typeof x.manufacturer === "string"
          ? x.manufacturer
          : x.manufacturer?.name;
    setGlazeDetailScroll(window.scrollY);
    setGlazeDetail({
      id: glazeId,
      name: glazeName,
      manufacturer: { name: manufacturer },
    });
    setGlazeDetailLoading(true);
    const r = await sb
      .from("glazes")
      .select(
        "id,name,sku,cone_min,cone_max,finish,opacity,movement_score,food_contact_note,notes,manufacturer:manufacturers(name),glaze_line:glaze_lines(name,cone_min,cone_max),intelligence:glaze_intelligence(manufacturer_movement,our_type,behavior_score,color_family,breaks_over_texture,pools,waterfall_potential,layer_reactivity,run_risk,layer_role,cone_text,dinnerware_safe,manufacturer_description,best_pairings,studio_notes,confidence,last_verified,food_safe_chemistry_claim,food_contact_surface_recommended,food_contact_restriction_reason)",
      )
      .eq("id", glazeId)
      .single();
    setGlazeDetailLoading(false);
    if (r.error) {
      setGlazeDetail(null);
      setMsg(r.error.message);
    } else setGlazeDetail(r.data);
  }
  async function openMaterialDetail(x: any) {
    setMaterialDetailScroll(window.scrollY);
    setMaterialDetail(x);
    const r = await sb
      .from("materials")
      .select("id,material_type,collection,sku,name,firing_range,cone_min,cone_max,finish,opacity,movement_behavior,primary_uses,mixable_layerable,food_safe_claim,food_contact_note,source_url,confidence,last_verified,manufacturer:manufacturers(name)")
      .eq("id", resultItemId(x))
      .single();
    if (!r.error && r.data) {
      setMaterialDetail({
        ...r.data,
        item_type: "underglaze",
        item_id: r.data.id,
        material_id: r.data.id,
        material_name: r.data.name,
        manufacturer: materialManufacturer(r.data),
      });
    }
  }
  function closeMaterialDetail() {
    setMaterialDetail(null);
    window.requestAnimationFrame(() => window.scrollTo(0, materialDetailScroll));
  }
  function closeGlazeDetail() {
    setGlazeDetail(null);
    window.requestAnimationFrame(() => window.scrollTo(0, glazeDetailScroll));
  }
  function coneRange(min: any, max: any) {
    if (min == null && max == null) return "Not yet recorded";
    if (min != null && max != null && String(min) !== String(max))
      return `Cone ${min}–${max}`;
    return `Cone ${min ?? max}`;
  }
  async function analyze() {
    const r = await sb.rpc("analyze_glaze_stack_v3", {
      p_glaze_ids: layers.map((x) => x.glaze_id),
      p_clay_id: clay?.clay_id ?? null,
      p_cone: cone,
      p_orientation: orientation,
      p_texture: texture,
      p_goal: goal || null,
      p_coats: layers.map((x) => x.coats),
      p_surfaces: layers.map((x) => x.surface || "inside & outside"),
      p_placements: layers.map((x) => x.placement || "overall"),
    });
    if (r.error) setMsg(r.error.message);
    else {
      setMsg("");
      setAnalysis(r.data?.[0]);
    }
  }
  async function saveRecipe(andFire?: boolean) {
    const name =
      recipeName.trim() ||
      layers.map((x) => x.glaze_name).join(" + ") ||
      "Saved Combination";
    const r = await sb.rpc("save_recipe_from_stack_v2", {
      p_name: name,
      p_clay_id: clay?.clay_id ?? null,
      p_cone: cone,
      p_form: projectDescription.trim() || orientation,
      p_texture: texture,
      p_goal: goal || null,
      p_glaze_ids: layers.map((x) => x.glaze_id),
      p_coats: layers.map((x) => x.coats),
      p_placements: layers.map(encodeApplication),
      p_prediction_verdict: analysis?.verdict || null,
      p_prediction_movement_risk:
        analysis?.movement_risk == null ? null : Number(analysis.movement_risk),
      p_prediction_warnings: analysis?.warnings || [],
      p_prediction_rationale: analysis?.rationale || null,
      p_prediction_confidence: analysis?.confidence || null,
      p_prediction_effect_match: analysis?.effect_match || null,
      p_prediction_food_guidance:
        analysis?.food_contact_guidance || null,
      p_prediction_compatibility: analysis?.compatibility || null,
      p_prediction_clay_influence: analysis?.clay_influence || null,
    });
    if (r.error) return setMsg(r.error.message);
    const newRecipeId =
      typeof r.data === "string" ? r.data : r.data?.[0]?.id || r.data?.id || "";
    setRecipeName("");
    setEditingRecipeId("");
    await load();
    if (andFire && newRecipeId) {
      setMsg("Recipe saved ✓ — log your firing below");
      startFiring(newRecipeId, cone);
      return;
    }
    setMsg("Recipe saved ✓");
    setShelfView("recipes");
    setTab("shelf");
  }
  async function updateRecipe() {
    if (!editingRecipeId) return;
    if (!layers.length) return setMsg("Add at least one glaze layer.");
    const r = await sb.rpc("update_recipe_from_stack", {
      p_recipe_id: editingRecipeId,
      p_name: recipeName.trim() || layers.map((x) => x.glaze_name).join(" + "),
      p_clay_id: clay?.clay_id ?? null,
      p_cone: cone,
      p_form: projectDescription.trim() || orientation,
      p_texture: texture,
      p_goal: goal || null,
      p_glaze_ids: layers.map((x) => x.glaze_id),
      p_coats: layers.map((x) => x.coats),
      p_placements: layers.map(encodeApplication),
      p_prediction_verdict: analysis?.verdict || null,
      p_prediction_movement_risk:
        analysis?.movement_risk == null ? null : Number(analysis.movement_risk),
      p_prediction_warnings: analysis ? analysis.warnings || [] : null,
      p_prediction_rationale: analysis?.rationale || null,
      p_prediction_confidence: analysis?.confidence || null,
      p_prediction_effect_match: analysis?.effect_match || null,
      p_prediction_food_guidance: analysis?.food_contact_guidance || null,
      p_prediction_compatibility: analysis?.compatibility || null,
      p_prediction_clay_influence: analysis?.clay_influence || null,
    });
    if (r.error) return setMsg(r.error.message);
    setMsg("Recipe updated ✓");
    await load();
  }
  async function deleteRecipe(id: string, name: string) {
    if (
      !window.confirm(
        `Delete “${name}”?\n\nThis permanently removes the recipe and any firing logs connected to it.`,
      )
    )
      return;
    const r = await sb.from("recipes").delete().eq("id", id);
    if (r.error) setMsg(r.error.message);
    else {
      if (recipe === id) setRecipe("");
      setRecipeDetail([]);
      setMsg("Recipe deleted ✓");
      await load();
    }
  }
  async function deleteFiring(id: string, recipeName: string) {
    if (
      !window.confirm(
        `Delete this firing of “${recipeName}”?\n\nThis permanently removes the firing log and any photos attached to it.`,
      )
    )
      return;
    const r = await sb.from("firings").delete().eq("id", id);
    if (r.error) return setMsg(r.error.message);
    if (firingDetail?.firing_id === id) setFiringDetail(null);
    setMsg("Firing deleted ✓");
    await load();
  }
  async function toggleRecipeStudioShare(recipeId: string, currentlyShared: boolean) {
    if (!currentStudio) return setMsg("Join or create a studio first.");
    setSharingRecipeId(recipeId);
    const r = currentlyShared
      ? await sb.rpc("unshare_recipe_from_studio", { p_recipe_id: recipeId })
      : await sb.rpc("share_recipe_to_studio", {
          p_recipe_id: recipeId,
          p_studio_id: currentStudio.studio_id,
        });
    setSharingRecipeId("");
    if (r.error) return setMsg(r.error.message);
    setMsg(currentlyShared ? "Recipe removed from studio ✓" : "Recipe shared with studio ✓");
    await load();
  }
  async function openStudioRecipes() {
    if (!currentStudio) return setMsg("Join or create a studio first.");
    setStudioRecipesOpen(true);
    setStudioRecipesLoading(true);
    const r = await sb.rpc("get_studio_recipes", {
      p_studio_id: currentStudio.studio_id,
    });
    setStudioRecipesLoading(false);
    if (r.error) return setMsg(r.error.message);
    setStudioRecipesList(r.data ?? []);
  }
  async function openRecipe(id: string) {
    const r = await sb.rpc("get_recipe_detail_v2", { p_recipe_id: id });
    if (r.error) setMsg(r.error.message);
    else setRecipeDetail(r.data ?? []);
  }
  function applyRecipeToBuilder(detailRows: any[]) {
    if (!detailRows.length) return;
    const first = detailRows[0];
    setEditingRecipeId(first.recipe_id);
    setClay(
      first.clay_id
        ? { clay_id: first.clay_id, clay_name: first.clay_name }
        : null,
    );
    setCone(Number(first.cone) || 6);
    setOrientation(
      ["vertical", "horizontal", "sculptural"].includes(first.form)
        ? first.form
        : "vertical",
    );
    setProjectDescription(
      first.form &&
        !["vertical", "horizontal", "sculptural"].includes(first.form)
        ? first.form
        : "",
    );
    setTexture(first.texture || "smooth");
    setGoal(first.goal || "");
    setRecipeName(first.recipe_name || "");
    setLayers(
      detailRows.map((x) => {
        const application = decodeApplication(x.placement);
        return {
          glaze_id: x.glaze_id,
          glaze_name: x.glaze_name,
          manufacturer: x.manufacturer,
          coats: Number(x.coats) || 2,
          ...application,
          placementMode: placementOptions.includes(application.placement)
            ? "preset"
            : "custom",
        };
      }),
    );
    setAnalysis(null);
    setRecipeDetail([]);
  }
  function editRecipe() {
    applyRecipeToBuilder(recipeDetail);
    setTab("build");
  }
  async function loadRecipeIntoBuilder(id: string) {
    if (!id) {
      setEditingRecipeId("");
      return;
    }
    const r = await sb.rpc("get_recipe_detail_v2", { p_recipe_id: id });
    if (r.error) return setMsg(r.error.message);
    applyRecipeToBuilder(r.data ?? []);
    setMsg("Recipe loaded into Builder ✓");
    window.requestAnimationFrame(() => window.scrollTo(0, 0));
  }
  function startFiring(id: string, recipeCone: any) {
    setRecipe(id);
    if (recipeCone) setCone(Number(recipeCone));
    setRecipeDetail([]);
    setCompletingFiringId("");
    setEditingHadResult(false);
    setGlazedDate(new Date().toISOString().slice(0, 10));
    setFiringDate("");
    setFiringSchedule("Standard / medium");
    setFiringOrientation("vertical");
    setMovement("");
    setTravelDistance("");
    setColorResult("");
    setSurfaceResult("");
    setDefects("");
    setFiringNotes("");
    setRating(5);
    setBeforePhoto([]);
    setPhoto([]);
    setJournalFormOpen(true);
    setTab("journal");
    window.requestAnimationFrame(() => window.scrollTo(0, 0));
  }
  function startEditingFiring(f: any) {
    setCompletingFiringId(f.firing_id);
    setEditingHadResult(!!f.fired_at);
    setRecipe(f.recipe_id);
    setCone(f.cone || 6);
    setGlazedDate(f.glazed_at || "");
    setFiringDate(
      f.fired_at
        ? new Date(f.fired_at).toISOString().slice(0, 10)
        : new Date().toISOString().slice(0, 10),
    );
    setFiringSchedule(f.schedule || "Standard / medium");
    setFiringOrientation(f.orientation || "vertical");
    setMovement(f.movement_result || "");
    setTravelDistance(f.travel_mm != null ? String(f.travel_mm) : "");
    setColorResult(f.color_result || "");
    setSurfaceResult(f.surface_result || "");
    setDefects(f.defects || "");
    setFiringNotes(f.notes || "");
    setRating(f.rating || 5);
    setBeforePhoto([]);
    setPhoto([]);
    setJournalFormOpen(true);
    window.requestAnimationFrame(() => window.scrollTo(0, 0));
  }
  async function uploadFiringPhoto(
    firingId: string,
    file: File,
    photoType: "before" | "after",
  ) {
    if (file.size > 10 * 1024 * 1024) {
      throw new Error(`${photoType === "before" ? "Before" : "After"} photo must be smaller than 10 MB.`);
    }
    const optimizedPhoto = await optimizeImageFile(file, 1800, 0.82);
    const safeName = optimizedPhoto.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `${session.user.id}/${firingId}/${photoType}-${Date.now()}-${safeName}`;
    const up = await sb.storage.from("firing-photos").upload(path, optimizedPhoto, {
      contentType: optimizedPhoto.type,
      cacheControl: "31536000",
    });
    if (up.error) throw up.error;
    const attached = await sb.rpc("attach_firing_photo", {
      p_firing_id: firingId,
      p_storage_path: path,
      p_photo_type: photoType,
    });
    if (attached.error) throw attached.error;
  }
  async function saveFiringUpdate() {
    if (!completingFiringId) return;
    setFiringSaving(true);
    const r = await sb.rpc("update_firing_setup", {
      p_firing_id: completingFiringId,
      p_cone: cone,
      p_schedule: firingSchedule || null,
      p_orientation: firingOrientation || null,
      p_glazed_at: glazedDate || null,
    });
    if (r.error) {
      setFiringSaving(false);
      return setMsg(r.error.message);
    }
    try {
      for (const f of beforePhoto) await uploadFiringPhoto(completingFiringId, f, "before");
      for (const f of photo) await uploadFiringPhoto(completingFiringId, f, "after");
    } catch (error: any) {
      setFiringSaving(false);
      await load();
      return setMsg(`Firing updated, but a photo could not upload: ${error.message}`);
    }
    setFiringSaving(false);
    setCompletingFiringId("");
    setEditingHadResult(false);
    setRecipe("");
    setBeforePhoto([]);
    setPhoto([]);
    setJournalFormOpen(false);
    setMsg("Firing updated ✓");
    await load();
  }
  async function fire(mode: "progress" | "complete") {
    if (!recipe) return setMsg("Choose a recipe.");
    const travel = travelDistance.trim() === "" ? null : Number(travelDistance);
    if (travel != null && (!Number.isFinite(travel) || travel < 0)) {
      return setMsg("Movement distance must be zero or more.");
    }
    if (mode === "complete" && !firingDate) {
      return setMsg("Choose the fired-on date to complete this firing.");
    }
    setFiringSaving(true);

    if (completingFiringId) {
      const r = await sb.rpc("complete_firing_result", {
        p_firing_id: completingFiringId,
        p_fired_at: new Date(`${firingDate}T12:00:00`).toISOString(),
        p_movement_result: movement || null,
        p_travel_mm: travel,
        p_color_result: colorResult || null,
        p_surface_result: surfaceResult || null,
        p_defects: defects || null,
        p_rating: rating,
        p_notes: firingNotes || null,
      });
      if (r.error) {
        setFiringSaving(false);
        return setMsg(r.error.message);
      }
      try {
        for (const f of beforePhoto) await uploadFiringPhoto(completingFiringId, f, "before");
        for (const f of photo) await uploadFiringPhoto(completingFiringId, f, "after");
      } catch (error: any) {
        setFiringSaving(false);
        await load();
        return setMsg(`Firing completed, but a photo could not upload: ${error.message}`);
      }
      setFiringSaving(false);
      setCompletingFiringId("");
      setEditingHadResult(false);
      setRecipe("");
      setBeforePhoto([]);
      setPhoto([]);
      setJournalFormOpen(false);
      setMsg("Firing completed ✓");
      return await load();
    }

    const r = await sb.rpc("log_firing_v2", {
      p_recipe_id: recipe,
      p_fired_at:
        mode === "complete"
          ? new Date(`${firingDate}T12:00:00`).toISOString()
          : null,
      p_cone: cone,
      p_schedule: firingSchedule || null,
      p_orientation: firingOrientation || null,
      p_movement_result: movement || null,
      p_travel_mm: travel,
      p_color_result: colorResult || null,
      p_surface_result: surfaceResult || null,
      p_defects: defects || null,
      p_rating: rating,
      p_notes: firingNotes || null,
      p_glazed_at: glazedDate || null,
    });
    if (r.error) {
      setFiringSaving(false);
      return setMsg(r.error.message);
    }
    try {
      for (const f of beforePhoto) await uploadFiringPhoto(r.data, f, "before");
      for (const f of photo) await uploadFiringPhoto(r.data, f, "after");
    } catch (error: any) {
      setFiringSaving(false);
      await load();
      return setMsg(`Firing saved, but a photo could not upload: ${error.message}`);
    }
    setFiringSaving(false);
    setRecipe("");
    setBeforePhoto([]);
    setPhoto([]);
    setJournalFormOpen(false);
    setMsg(mode === "progress" ? "Firing saved as in progress ✓" : "Firing result saved ✓");
    await load();
  }
  async function toggleFiringShare(firingId: string, nextShared: boolean, photoCount: number) {
    if (nextShared && Number(photoCount) < 1) {
      return setMsg("Add at least one firing photo before sharing in Explore.");
    }
    setSharingFiringId(firingId);
    const r = await sb.rpc("set_firing_shared", {
      p_firing_id: firingId,
      p_shared: nextShared,
    });
    setSharingFiringId("");
    if (r.error) return setMsg(r.error.message);
    setFirings((current) =>
      current.map((item) =>
        item.firing_id === firingId ? { ...item, shared: nextShared } : item,
      ),
    );
    setMsg(nextShared ? "Firing shared in Explore ✓" : "Firing removed from Explore ✓");
    if (exploreStarted) await searchExplore();
  }
  async function searchExplore() {
    setExploreLoading(true);
    setExploreStarted(true);
    setMsg("");
    const r = await sb.rpc("get_explore_firings", {
      p_query: exploreQuery.trim() || null,
      p_glaze_id: null,
      p_clay_id: null,
      p_effect: exploreEffect || null,
      p_cone: exploreCone ? Number(exploreCone) : null,
      p_min_rating: exploreRating ? Number(exploreRating) : null,
      p_limit: 40,
    });
    if (r.error) {
      setExploreLoading(false);
      setExploreResults([]);
      return setMsg(r.error.message);
    }
    const signedRows = await Promise.all(
      (r.data ?? []).map(async (item: any) => {
        if (!item.primary_photo_path) return item;
        const signed = await sb.storage
          .from("firing-photos")
          .createSignedUrl(item.primary_photo_path, 3600);
        return { ...item, primaryPhotoUrl: signed.data?.signedUrl || "" };
      }),
    );
    setExploreResults(signedRows);
    setExploreLoading(false);
  }
  function openExplore() {
    setMsg("");
    setTab("explore");
    window.requestAnimationFrame(() => window.scrollTo(0, 0));
    if (!exploreStarted) void searchExplore();
  }
  function clearExplore() {
    setExploreQuery("");
    setExploreEffect("");
    setExploreCone("");
    setExploreRating("");
    setExploreResults([]);
    setExploreStarted(false);
    setMsg("");
  }
  async function view(id: string) {
    const r = await sb.rpc("get_firing_photos", { p_firing_id: id });
    if (!r.data?.length) return setMsg("No photo.");
    const s = await sb.storage
      .from("firing-photos")
      .createSignedUrl(r.data[0].storage_path, 3600);
    if (s.data) setPreview(s.data.signedUrl);
  }
  async function openFiringDetail(id: string) {
    setFiringDetailLoading(true);
    setFiringDetail({ firing_id: id });
    setFiringDetailPhotos([]);
    setFiringComments([]);
    setNewComment("");
    const [detail, photos, comments] = await Promise.all([
      sb.rpc("get_firing_detail_v2", { p_firing_id: id }),
      sb.rpc("get_firing_photos", { p_firing_id: id }),
      sb.rpc("get_firing_comments", { p_firing_id: id }),
    ]);
    if (detail.error || photos.error) {
      setFiringDetailLoading(false);
      setFiringDetail(null);
      return setMsg(detail.error?.message || photos.error?.message || "Could not load firing details.");
    }
    const photoRows = photos.data ?? [];
    const signed = await Promise.all(
      photoRows.map(async (item: any) => {
        const url = await sb.storage
          .from("firing-photos")
          .createSignedUrl(item.storage_path, 3600);
        return { ...item, signedUrl: url.data?.signedUrl || "" };
      }),
    );
    setFiringDetail(detail.data?.[0] || null);
    setFiringDetailPhotos(signed.filter((item) => item.signedUrl));
    setFiringComments(comments.data ?? []);
    setFiringDetailLoading(false);
  }
  async function postFiringComment() {
    if (!firingDetail?.firing_id || !newComment.trim()) return;
    setCommentPosting(true);
    const r = await sb.rpc("add_firing_comment", {
      p_firing_id: firingDetail.firing_id,
      p_comment: newComment.trim(),
    });
    setCommentPosting(false);
    if (r.error) return setMsg(r.error.message);
    setNewComment("");
    const refreshed = await sb.rpc("get_firing_comments", {
      p_firing_id: firingDetail.firing_id,
    });
    setFiringComments(refreshed.data ?? []);
  }
  async function deleteFiringComment(commentId: string) {
    const r = await sb.rpc("delete_firing_comment", { p_comment_id: commentId });
    if (r.error) return setMsg(r.error.message);
    setFiringComments((current) => current.filter((c) => c.comment_id !== commentId));
  }
  const combinedMaterials = useMemo(() => {
    const items = new Map<string, any>();
    shelf.forEach((x) => {
      const onMyShelf = x.status === "owned" || x.status === "low";
      items.set(`${x.item_type}:${x.item_id}`, {
        ...x,
        onMyShelf,
        onWantToTry: x.status === "wishlist",
        onStudioShelf: false,
        personalStatus: x.status,
        personalQuantity: x.quantity,
        personalContainerSize: x.container_size,
        personalNotes: x.notes,
        personalUpdatedAt: x.updated_at,
      });
    });
    studioShelf.forEach((x) => {
      const key = `${x.item_type}:${x.item_id}`,
        existing = items.get(key);
      items.set(key, {
        ...(existing || {}),
        item_type: x.item_type,
        item_id: x.item_id,
        item_name: existing?.item_name || x.item_name,
        manufacturer: existing?.manufacturer || x.manufacturer,
        sku_or_code: existing?.sku_or_code || x.sku_or_code,
        cone_min: existing?.cone_min ?? x.cone_min,
        cone_max: existing?.cone_max ?? x.cone_max,
        onMyShelf: !!existing?.onMyShelf,
        onWantToTry: !!existing?.onWantToTry,
        onStudioShelf: x.status === "available" || x.status === "low",
        studioStatus: x.status,
        studioQuantity: x.quantity,
        studioContainerSize: x.container_size,
        studioNotes: x.notes,
        studioUpdatedAt: x.updated_at,
      });
    });
    return [...items.values()];
  }, [shelf, studioShelf]);
  const ownedMaterials = useMemo(
    () => combinedMaterials.filter((x) => x.onMyShelf || x.onStudioShelf),
    [combinedMaterials],
  );
  const wantToTryMaterials = useMemo(
    () => combinedMaterials.filter((x) => x.onWantToTry && !x.onMyShelf),
    [combinedMaterials],
  );
  const shelfBrands = useMemo(
    () =>
      [...new Set(ownedMaterials.map((x) => x.manufacturer).filter(Boolean))].sort(
        (a, b) => String(a).localeCompare(String(b)),
      ),
    [ownedMaterials],
  );
  const shelfFiltersActive =
    !!shelfQuery.trim() ||
    shelfTypeFilter !== "all" ||
    shelfBrandFilter !== "all" ||
    shelfConeFilter !== "all" ||
    shelfStockFilter !== "all";
  const visibleShelfMaterials = useMemo(() => {
    const chosenCone = shelfConeFilter === "all" ? null : Number(shelfConeFilter);
    const filtered = ownedMaterials.filter((x) => {
      const searchable = `${x.item_name || ""} ${x.manufacturer || ""} ${x.sku_or_code || ""}`;
      const matchesCone =
        chosenCone == null ||
        ((x.cone_min == null || chosenCone >= Number(x.cone_min)) &&
          (x.cone_max == null || chosenCone <= Number(x.cone_max)));
      const low = x.personalStatus === "low" || x.studioStatus === "low";
      return (
        smartMatch(searchable, shelfQuery) &&
        (shelfTypeFilter === "all" || x.item_type === shelfTypeFilter) &&
        (shelfBrandFilter === "all" || x.manufacturer === shelfBrandFilter) &&
        matchesCone &&
        (shelfStockFilter === "all" || low)
      );
    });
    return filtered.sort((a, b) => {
      if (shelfSort === "brand") {
        return `${a.manufacturer} ${a.item_name}`.localeCompare(
          `${b.manufacturer} ${b.item_name}`,
        );
      }
      if (shelfSort === "recent") {
        const aDate = a.personalUpdatedAt || a.studioUpdatedAt || "";
        const bDate = b.personalUpdatedAt || b.studioUpdatedAt || "";
        return String(bDate).localeCompare(String(aDate));
      }
      return String(a.item_name).localeCompare(String(b.item_name));
    });
  }, [
    ownedMaterials,
    shelfQuery,
    shelfSort,
    shelfTypeFilter,
    shelfBrandFilter,
    shelfConeFilter,
    shelfStockFilter,
  ]);
  function clearShelfFilters() {
    setShelfQuery("");
    setShelfTypeFilter("all");
    setShelfBrandFilter("all");
    setShelfConeFilter("all");
    setShelfStockFilter("all");
  }
  const currentStudio =
    studios.find((s) => s.studio_id === studio) ||
    studios.find((s) => s.is_default) ||
    studios[0];
  const canEditStudio = ["owner", "admin", "editor"].includes(
    currentStudio?.role || "",
  );
  const detailIntel = glazeDetail
    ? Array.isArray(glazeDetail.intelligence)
      ? glazeDetail.intelligence[0]
      : glazeDetail.intelligence
    : null;
  const detailLine = glazeDetail
    ? Array.isArray(glazeDetail.glaze_line)
      ? glazeDetail.glaze_line[0]
      : glazeDetail.glaze_line
    : null;
  const detailManufacturer = glazeDetail
    ? Array.isArray(glazeDetail.manufacturer)
      ? glazeDetail.manufacturer[0]?.name
      : glazeDetail.manufacturer?.name
    : "";
  const detailCone = glazeDetail
    ? detailIntel?.cone_text ||
      coneRange(
        glazeDetail.cone_min ?? detailLine?.cone_min,
        glazeDetail.cone_max ?? detailLine?.cone_max,
      )
    : "";
  const detailFoodChemistry =
    detailIntel?.food_safe_chemistry_claim || "Not yet verified";
  const detailFoodContact =
    detailIntel?.food_contact_surface_recommended ||
    detailIntel?.dinnerware_safe ||
    glazeDetail?.food_contact_note ||
    "Not yet verified";
  const detailFoodClass = String(detailFoodContact)
    .toLowerCase()
    .includes("not yet")
    ? "unknown"
    : String(detailFoodContact).toLowerCase() === "yes"
      ? "safe"
      : "caution";
  const myGlazeCount = shelf.filter((x) => x.item_type === "glaze").length;
  if (recovery)
    return (
      <main className="simple-auth-shell">
        <img className="auth-glaze-flow" src={homeGlazeFlow.src} alt="" aria-hidden="true" />
        <section className="simple-auth-wrap">
          <img
            className="simple-auth-logo"
            src={homeLogo.src}
            alt="The Glaze Shelf"
          />
          <div className="simple-auth-card">
          <h1>Create a new password</h1>
          <p className="simple-auth-help">
            Choose a password with at least 8 characters.
          </p>
          <div className="stack simple-auth-form">
            <div className="password-field-wrap">
              <input
                className="input"
                type={visiblePasswordFields.has("newPassword") ? "text" : "password"}
                autoComplete="new-password"
                placeholder="New password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              {renderPasswordToggle("newPassword")}
            </div>
            <div className="password-field-wrap">
              <input
                className="input"
                type={visiblePasswordFields.has("confirmNewPassword") ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              {renderPasswordToggle("confirmNewPassword")}
            </div>
            <button
              className="btn simple-auth-primary"
              onClick={saveNewPassword}
            >
              Save New Password
            </button>
            <button
              className="btn ghost simple-auth-create"
              onClick={async () => {
                await sb.auth.signOut();
                window.location.reload();
              }}
            >
              Back to Sign In
            </button>
            {msg && <div className="notice">{msg}</div>}
          </div>
          </div>
        </section>
      </main>
    );
  if (!session)
    return (
      <main className="simple-auth-shell">
        <img className="auth-glaze-flow" src={homeGlazeFlow.src} alt="" aria-hidden="true" />
        <section className="simple-auth-wrap">
          <img
            className="simple-auth-logo"
            src={homeLogo.src}
            alt="The Glaze Shelf"
          />
          <div className="simple-auth-card">
          {authMode === "signup" ? (
            <>
              <h1>Create an Account</h1>
              <form
                className="stack simple-auth-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  auth(true);
                }}
              >
                <label className="auth-field">
                  Email
                  <input
                    className="input"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </label>
                <label className="auth-field">
                  Password
                  <div className="password-field-wrap">
                    <input
                      className="input"
                      type={visiblePasswordFields.has("signupPassword") ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="At least 8 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    {renderPasswordToggle("signupPassword")}
                  </div>
                </label>
                <label className="auth-field">
                  Confirm Password
                  <div className="password-field-wrap">
                    <input
                      className="input"
                      type={visiblePasswordFields.has("signupConfirm") ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="Re-enter your password"
                      value={signupConfirmPassword}
                      onChange={(e) => setSignupConfirmPassword(e.target.value)}
                    />
                    {renderPasswordToggle("signupConfirm")}
                  </div>
                </label>
                <button className="btn simple-auth-primary" type="submit">
                  Create Account <ArrowRight size={18} />
                </button>
                <div className="auth-divider">
                  <span>Already have an account?</span>
                </div>
                <button
                  className="btn ghost simple-auth-create"
                  type="button"
                  onClick={() => {
                    setAuthMode("signin");
                    setPassword("");
                    setSignupConfirmPassword("");
                    setMsg("");
                  }}
                >
                  Back to Sign In
                </button>
                {msg && <div className="notice">{msg}</div>}
              </form>
            </>
          ) : (
            <>
          <h1>Sign in</h1>
          <form
            className="stack simple-auth-form"
            onSubmit={(e) => {
              e.preventDefault();
              auth();
            }}
          >
            <label className="auth-field">
              Email
              <input
                className="input"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            <label className="auth-field">
              Password
              <div className="password-field-wrap">
                <input
                  className="input"
                  type={visiblePasswordFields.has("signinPassword") ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {renderPasswordToggle("signinPassword")}
              </div>
            </label>
            <button
              className="forgot-link"
              type="button"
              onClick={forgotPassword}
            >
              Forgot password?
            </button>
            <button className="btn simple-auth-primary" type="submit">
              Sign In <ArrowRight size={18} />
            </button>
            <div className="auth-divider">
              <span>New here?</span>
            </div>
            <button
              className="btn ghost simple-auth-create"
              type="button"
              onClick={() => {
                setAuthMode("signup");
                setPassword("");
                setMsg("");
              }}
            >
              Create an Account
            </button>
            {msg && <div className="notice">{msg}</div>}
          </form>
            </>
          )}
          </div>
        </section>
      </main>
    );
  return (
    <>
      {showLoginSpin && (
        <div className="pottery-login-intro" aria-hidden="true">
          <div className="pottery-wheel-ring">
            <div className="pottery-wheel-cup" aria-hidden="true">
              <img src={spinnerCup.src} alt="" />
            </div>
          </div>
        </div>
      )}
      <main className={"shell " + (tab === "home" ? "home-shell" : "")}>
        <AppHeader
          hidden={tab === "home"}
          activeScreen={tab}
          avatarUrl={session.user.user_metadata?.avatar_url}
          onProfile={() => {
            setMsg("");
            setTab("account");
          }}
          onSignOut={async () => {
            await sb.auth.signOut();
            window.location.reload();
          }}
        />
        {tab !== "home" && (
          <img
            className={`page-glaze-flow page-glaze-flow-${tab}`}
            src={homeGlazeFlow.src}
            alt=""
            aria-hidden="true"
          />
        )}

        {tab === "home" && (
          <>
            <header className="home-brand-header">
              <img className="home-brand-logo" src={homeLogo.src} alt="The Glaze Shelf — your pottery workspace" />
              <div className="home-header-actions">
                <button
                  className="home-account"
                  aria-label="Account settings"
                  onClick={() => {
                    setMsg("");
                    setTab("account");
                  }}
                >
                  {session.user.user_metadata?.avatar_url ? (
                    <img src={session.user.user_metadata.avatar_url} alt="" />
                  ) : (
                    <UserRound size={22} />
                  )}
                </button>
                <button
                  className="home-signout"
                  aria-label="Sign out"
                  onClick={async () => {
                    await sb.auth.signOut();
                    window.location.reload();
                  }}
                >
                  <LogOut size={20} />
                </button>
              </div>
            </header>

            <div className="home-glaze-stage">
              <section className="home-layered-welcome">
                <div className="home-welcome-copy">
                  <span>WELCOME BACK</span>
                  <h1>What are you making next?</h1>
                  <p>Build it. Fire it. Learn from it.</p>
                </div>
                <img className="home-pottery-bowl" src={homeBowl.src} alt="" aria-hidden="true" />
              </section>

              <img className="home-glaze-flow" src={homeGlazeFlow.src} alt="" aria-hidden="true" />

              <section className="home-finder-feature">
                <h2>Find the right glaze for your vision.</h2>
                <p>Search by name, color, movement, finish, or what is already on your shelf.</p>
                <button onClick={() => openFinder("all")}>
                  Start Finding <ArrowRight size={19} />
                </button>
              </section>
            </div>

            <section className="home-current-studio">
              {currentStudio?.photo_url ? (
                <img className="home-studio-pin-photo" src={currentStudio.photo_url} alt="" />
              ) : (
                <span className="home-studio-pin" aria-hidden="true">
                  <MapPin size={25} strokeWidth={2.5} />
                </span>
              )}
              <button
                className="home-studio-main"
                type="button"
                disabled={!currentStudio}
                onClick={() => currentStudio && openStudio(currentStudio.studio_id)}
              >
                <span>WORKING AT</span>
                <strong>{currentStudio?.name || "No studio connected yet"}</strong>
              </button>
              <button
                className="home-studio-change"
                type="button"
                onClick={() => setHomeStudioManagerOpen(true)}
              >
                {currentStudio ? "Studio Details" : "Set Up"}
              </button>
            </section>

            <section className="home-continue">
              <div className="home-continue-heading">
                <h2>Continue where you left off</h2>
                <button
                  type="button"
                  onClick={() => recipes[0] ? openRecipe(recipes[0].recipe_id) : setTab("build")}
                >
                  {recipes[0] ? "Open" : "Start"}
                </button>
              </div>
              <button
                className="home-recipe-card"
                type="button"
                onClick={() => recipes[0] ? openRecipe(recipes[0].recipe_id) : setTab("build")}
              >
                <span className="home-recipe-swatch" aria-hidden="true" />
                <span>
                  <strong>{recipes[0]?.name || "Build your first combination"}</strong>
                  <small>
                    {recipes[0]
                      ? `Saved combination · Cone ${recipes[0].cone}`
                      : "Choose your clay and glaze layers"}
                  </small>
                </span>
                <ArrowRight size={18} />
              </button>
            </section>

            {homeStudioManagerOpen && (
              <div className="overlay home-studio-overlay" onClick={() => setHomeStudioManagerOpen(false)}>
                <section className="home-studio-sheet" onClick={(event) => event.stopPropagation()}>
                  <div className="row">
                    <div>
                      <span className="eyebrow">MY STUDIO</span>
                      <h2>Choose or add a studio</h2>
                    </div>
                    <button className="close" aria-label="Close studio choices" onClick={() => setHomeStudioManagerOpen(false)}>×</button>
                  </div>
                  {studios.map((item) => (
                    <button
                      className={"studio-list-item " + (item.studio_id === currentStudio?.studio_id ? "selected" : "")}
                      key={item.studio_id}
                      onClick={() => chooseHomeStudio(item.studio_id)}
                    >
                      <span className="row" style={{ gap: 10 }}>
                        {item.photo_url ? (
                          <img className="studio-logo" src={item.photo_url} alt="" />
                        ) : (
                          <span className="studio-logo studio-logo-placeholder" aria-hidden="true">
                            {item.name?.[0]?.toUpperCase() || "?"}
                          </span>
                        )}
                        <span>
                          <strong>{item.name}</strong>
                          <small>{item.role === "owner" ? "You created this studio" : "Member"}</small>
                        </span>
                      </span>
                      <span>{item.studio_id === currentStudio?.studio_id ? "Current" : "Choose →"}</span>
                    </button>
                  ))}
                  {currentStudio?.role === "owner" && (
                    <label className="btn ghost studio-photo-upload">
                      {studioPhotoUploading
                        ? "Uploading…"
                        : currentStudio.photo_url
                          ? `Change ${currentStudio.name}'s Photo`
                          : `Add a Photo for ${currentStudio.name}`}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
                        style={{ display: "none" }}
                        disabled={studioPhotoUploading}
                        onChange={(e) => chooseStudioPhoto(e.target.files?.[0])}
                      />
                    </label>
                  )}
                  {currentStudio?.role === "owner" && (
                    <button className="btn ghost" onClick={() => invite(currentStudio.studio_id)}>
                      Invite Someone to {currentStudio.name}
                    </button>
                  )}
                  {inviteCodeShown && (
                    <div className="card invite-code-card">
                      <span className="eyebrow">INVITE CODE</span>
                      {editingInviteCode ? (
                        <>
                          <input
                            className="input invite-code-input"
                            placeholder="6-20 characters"
                            maxLength={20}
                            value={customCodeInput}
                            onChange={(e) => setCustomCodeInput(e.target.value.toUpperCase())}
                          />
                          <div className="invite-code-actions">
                            <button
                              className="btn primary"
                              onClick={() => saveCustomInviteCode(currentStudio.studio_id)}
                            >
                              Save Code
                            </button>
                            <button
                              className="btn ghost"
                              onClick={() => {
                                setEditingInviteCode(false);
                                setCustomCodeInput("");
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <strong className="invite-code-value">{inviteCodeShown}</strong>
                          <div className="invite-code-actions">
                            <button className={"btn " + (codeCopied ? "is-shared" : "primary")} onClick={copyInviteCode}>
                              {codeCopied ? "Copied ✓" : "Copy Code"}
                            </button>
                            <button
                              className="btn ghost"
                              onClick={() => {
                                setInviteCodeShown("");
                                setCodeCopied(false);
                              }}
                            >
                              Done
                            </button>
                          </div>
                          <button
                            className="btn ghost invite-code-edit-link"
                            onClick={() => {
                              setEditingInviteCode(true);
                              setCustomCodeInput(inviteCodeShown);
                            }}
                          >
                            Edit Code
                          </button>
                        </>
                      )}
                    </div>
                  )}
                  {currentStudio?.role === "owner" && !showTransferPanel && (
                    <button
                      className="btn ghost"
                      onClick={() => openTransferPanel(currentStudio.studio_id)}
                    >
                      Transfer Ownership of {currentStudio.name}
                    </button>
                  )}
                  {showTransferPanel && (
                    <div className="card transfer-ownership-card">
                      <span className="eyebrow">TRANSFER OWNERSHIP</span>
                      <p className="muted">
                        Choose an existing member to become the new owner. You'll stay on as an admin.
                      </p>
                      {studioMembers.length === 0 ? (
                        <p className="muted">
                          No other members yet — invite someone first, then come back here.
                        </p>
                      ) : (
                        <label className="field-label">
                          New Owner
                          <select
                            className="select"
                            value={transferTargetId}
                            onChange={(e) => setTransferTargetId(e.target.value)}
                          >
                            <option value="">Choose a member…</option>
                            {studioMembers.map((m) => (
                              <option key={m.user_id} value={m.user_id}>
                                {m.display_name}
                              </option>
                            ))}
                          </select>
                        </label>
                      )}
                      <div className="transfer-ownership-actions">
                        <button
                          className="btn ghost"
                          onClick={() => setShowTransferPanel(false)}
                        >
                          Cancel
                        </button>
                        <button
                          className="btn primary"
                          disabled={!transferTargetId || transferring}
                          onClick={() => transferOwnership(currentStudio.studio_id)}
                        >
                          {transferring ? "Transferring…" : "Transfer Ownership"}
                        </button>
                      </div>
                    </div>
                  )}
                  {currentStudio?.role === "owner" && !showDeleteStudioPanel && (
                    <button
                      className="btn ghost delete-studio-link"
                      onClick={() => {
                        setShowDeleteStudioPanel(true);
                        setDeleteStudioConfirmText("");
                      }}
                    >
                      Delete {currentStudio.name}
                    </button>
                  )}
                  {showDeleteStudioPanel && (
                    <div className="card delete-studio-card">
                      <span className="eyebrow">DANGER ZONE</span>
                      <p className="muted">
                        This permanently deletes {currentStudio.name}, its shared shelf, and removes every
                        member. It cannot be undone. Members' personal recipes and firings are not affected.
                      </p>
                      <label className="field-label">
                        Type "{currentStudio.name}" to confirm
                        <input
                          className="input"
                          placeholder={currentStudio.name}
                          value={deleteStudioConfirmText}
                          onChange={(e) => setDeleteStudioConfirmText(e.target.value)}
                        />
                      </label>
                      <div className="transfer-ownership-actions">
                        <button
                          className="btn ghost"
                          onClick={() => setShowDeleteStudioPanel(false)}
                        >
                          Cancel
                        </button>
                        <button
                          className="btn delete-btn"
                          disabled={
                            deleteStudioConfirmText !== currentStudio.name || deletingStudio
                          }
                          onClick={() => deleteStudio(currentStudio.studio_id, currentStudio.name)}
                        >
                          {deletingStudio ? "Deleting…" : "Permanently Delete Studio"}
                        </button>
                      </div>
                    </div>
                  )}
                  <div className="studio-divider"><span>add another studio</span></div>
                  <label className="field-label">
                    Studio Name
                    <input className="input" placeholder="e.g., My Studio" value={studioName} onChange={(e) => setStudioName(e.target.value)} />
                  </label>
                  <button className="btn secondary" onClick={createStudio}>Create Studio</button>
                  <div className="studio-divider"><span>or join one</span></div>
                  <label className="field-label">
                    Invite Code
                    <input className="input" placeholder="Enter invite code" autoComplete="off" autoCorrect="off" autoCapitalize="characters" spellCheck={false} value={join} onChange={(e) => setJoin(e.target.value)} />
                  </label>
                  <button className="btn ghost" onClick={joinStudio}>Join Studio</button>
                  {joinMsg && <div className="notice join-studio-notice">{joinMsg}</div>}
                </section>
              </div>
            )}
          </>
        )}

        {tab === "account" && (
          <>
            <section className="hero account-hero">
              <span className="eyebrow">YOUR ACCOUNT</span>
              <h1>Profile &amp; Preferences</h1>
              <p>Keep your details and glaze defaults up to date.</p>
            </section>
            {msg && (
              <div className="notice account-notice" role="status">
                {msg}
              </div>
            )}
            <section className="card account-card">
              <div className="account-photo-row">
                <div className="account-avatar">
                  {profilePreview ? (
                    <img src={profilePreview} alt="Profile preview" />
                  ) : (
                    <UserRound size={34} />
                  )}
                </div>
                <div>
                  <strong>Profile picture</strong>
                  <div className="account-photo-actions">
                    <label className="account-photo-button" htmlFor="profile-photo">
                      {profilePreview ? "Change photo" : "Add photo"}
                    </label>
                    {profilePreview && (
                      <button
                        className="account-photo-remove"
                        type="button"
                        onClick={removeProfilePhoto}
                        disabled={accountSaving}
                      >
                        Remove photo
                      </button>
                    )}
                  </div>
                  <input
                    id="profile-photo"
                    className="account-photo-input"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
                    onChange={(e) => chooseProfilePhoto(e.target.files?.[0])}
                  />
                </div>
              </div>
              <div className="stack account-fields">
                <label className="field-label">
                  Name
                  <input
                    className="input"
                    autoComplete="name"
                    placeholder="Your name"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                  />
                </label>
                <label className="field-label">
                  Email
                  <input
                    className="input"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={accountEmail}
                    onChange={(e) => setAccountEmail(e.target.value)}
                  />
                </label>
                {(session.user as any).new_email && (
                  <p className="account-pending">
                    Awaiting confirmation for {(session.user as any).new_email}
                  </p>
                )}
              </div>
            </section>
            <section className="card account-card">
              <span className="eyebrow">GLAZE DEFAULTS</span>
              <div className="account-preference-grid">
                <label className="field-label">
                  Default Firing Cone
                  <select
                    className="select"
                    value={profileDefaultCone}
                    onChange={(e) => setProfileDefaultCone(e.target.value)}
                  >
                    {[5, 6, 7, 8, 9, 10].map((value) => (
                      <option key={value} value={value}>
                        Cone {value}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="field-label">
                  Preferred Studio
                  <select
                    className="select"
                    value={profileStudio}
                    onChange={(e) => setProfileStudio(e.target.value)}
                  >
                    <option value="">No preferred studio</option>
                    {studios.map((item) => (
                      <option key={item.studio_id} value={item.studio_id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <button
                className="btn account-save-button"
                onClick={saveAccountProfile}
                disabled={accountSaving}
              >
                {accountSaving ? "Saving…" : "Save Profile & Preferences"}
              </button>
            </section>
            <section className="card account-card">
              <span className="eyebrow">SECURITY</span>
              <h2>Change password</h2>
              <div className="stack account-fields">
                <div className="password-field-wrap">
                  <input
                    className="input"
                    type={visiblePasswordFields.has("accountPassword") ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="New password"
                    value={accountPassword}
                    onChange={(e) => setAccountPassword(e.target.value)}
                  />
                  {renderPasswordToggle("accountPassword")}
                </div>
                <div className="password-field-wrap">
                  <input
                    className="input"
                    type={visiblePasswordFields.has("accountPasswordConfirm") ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Confirm new password"
                    value={accountPasswordConfirm}
                    onChange={(e) => setAccountPasswordConfirm(e.target.value)}
                  />
                  {renderPasswordToggle("accountPasswordConfirm")}
                </div>
                <button
                  className="btn secondary"
                  onClick={changeAccountPassword}
                >
                  Update Password
                </button>
              </div>
            </section>
            <button
              className="btn account-signout-button"
              onClick={async () => {
                await sb.auth.signOut();
                window.location.reload();
              }}
            >
              <LogOut size={18} /> Sign Out
            </button>
            <section className="card account-card account-danger-card">
              <span className="eyebrow">DANGER ZONE</span>
              <h2>Delete account</h2>
              <p>
                Permanently delete your profile, My Shelf, Want to Try list,
                recipes, firing journal, and uploaded photos. Shared studios
                with other members will remain available.
              </p>
              {!showDeleteAccount ? (
                <button
                  className="btn account-delete-button"
                  onClick={() => {
                    setMsg("");
                    setShowDeleteAccount(true);
                  }}
                >
                  Delete My Account
                </button>
              ) : (
                <div className="account-delete-confirmation">
                  <p className="account-delete-warning">
                    This cannot be undone. Enter your password and type
                    <strong> DELETE</strong> to confirm.
                  </p>
                  <label className="field-label">
                    Current Password
                    <div className="password-field-wrap">
                      <input
                        className="input"
                        type={visiblePasswordFields.has("deleteAccountPassword") ? "text" : "password"}
                        autoComplete="current-password"
                        placeholder="Your password"
                        value={deleteAccountPassword}
                        onChange={(e) => setDeleteAccountPassword(e.target.value)}
                      />
                      {renderPasswordToggle("deleteAccountPassword")}
                    </div>
                  </label>
                  <label className="field-label">
                    Type DELETE
                    <input
                      className="input"
                      autoComplete="off"
                      spellCheck={false}
                      placeholder="DELETE"
                      value={deleteAccountConfirmation}
                      onChange={(e) =>
                        setDeleteAccountConfirmation(e.target.value)
                      }
                    />
                  </label>
                  <div className="account-delete-actions">
                    <button
                      className="btn ghost"
                      type="button"
                      disabled={deletingAccount}
                      onClick={() => {
                        setShowDeleteAccount(false);
                        setDeleteAccountPassword("");
                        setDeleteAccountConfirmation("");
                        setMsg("");
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      className="btn account-delete-final"
                      type="button"
                      disabled={
                        deletingAccount ||
                        !deleteAccountPassword ||
                        deleteAccountConfirmation.trim() !== "DELETE"
                      }
                      onClick={deleteAccount}
                    >
                      {deletingAccount
                        ? "Deleting Account…"
                        : "Permanently Delete Account"}
                    </button>
                  </div>
                </div>
              )}
            </section>
          </>
        )}

        {tab === "studio" && (
          <>
            <section className="hero">
              <span className="eyebrow">MY STUDIO</span>
              <div className="studio-hero-row">
                {studios.find((s) => s.studio_id === studio)?.photo_url && (
                  <img
                    className="studio-hero-photo"
                    src={studios.find((s) => s.studio_id === studio)?.photo_url}
                    alt=""
                  />
                )}
                <div>
                  <h1>
                    {studios.find((s) => s.studio_id === studio)?.name ||
                      "Studio Shelf"}
                  </h1>
                  <p>Everything available in this studio.</p>
                </div>
              </div>
            </section>
            <div className="grid">
              <button className="btn primary" onClick={() => openFinder("all")}>
                + Add Glaze
              </button>
              <button className="btn secondary" onClick={() => openUnderglazeFinder("all")}>
                + Add Underglaze
              </button>
              <button
                className="btn secondary"
                onClick={openClayFinder}
              >
                + Add Clay
              </button>
            </div>
            <button
              className="btn shelf-effect-button studio-search-button"
              onClick={() => openFinder("studio")}
            >
              <Search size={18} /> Search This Studio Shelf
            </button>
            {studioShelf.length === 0 && (
              <div className="card">
                <strong>This studio shelf is empty.</strong>
                <p className="muted">
                  Add the glazes, underglazes, and clay bodies this studio carries. Once
                  they’re here, the Finder can tell you what combinations are
                  actually available in this studio.
                </p>
              </div>
            )}
            {studioShelf.length > 0 && (
              <details className="material-list-details">
                <summary>
                  <span>Studio materials</span>
                  <span>{studioShelf.length} {studioShelf.length === 1 ? "material" : "materials"}</span>
                </summary>
                <div className="material-list-scroll">
            {studioShelf.map((x) => (
              <div className="item" key={x.item_type + x.item_id}>
                <div className="row">
                  <strong>{x.item_name}</strong>
                  <span className={"stock-badge " + (x.status === "low" ? "low" : "")}>
                    {x.status === "low" ? "Low stock" : x.status || "available"}
                  </span>
                </div>
                <div className="muted">
                  {x.manufacturer} • {x.item_type}
                </div>
                {(x.quantity != null || x.container_size || x.notes) && (
                  <div className="inventory-summary">
                    {x.quantity != null && <span>{x.quantity} on hand</span>}
                    {x.container_size && <span>{x.container_size}</span>}
                    {x.notes && <p>{x.notes}</p>}
                  </div>
                )}
                {x.item_type === "underglaze" && (
                  <button className="detail-link" onClick={() => openMaterialDetail(x)}>
                    View Details <ArrowRight size={16} />
                  </button>
                )}
                {canEditStudio && (
                  <button
                    className="inventory-edit studio studio-card-edit"
                    onClick={() => openInventoryEditor(x, "studio")}
                  >
                    Edit Inventory
                  </button>
                )}
              </div>
            ))}
                </div>
              </details>
            )}
            <button
              className="btn ghost"
              style={{ width: "100%", marginTop: 12 }}
              onClick={() => setTab("home")}
            >
              ← Back to Home
            </button>
          </>
        )}

        {tab === "shelf" && (
          <>
            <section className="hero shelf-hero">
              <span className="eyebrow">YOUR COLLECTION</span>
              <h1>My Shelf</h1>
              <p>Know what you have. Discover what works.</p>
            </section>
            <div className="segmented shelf-segmented">
              <button
                className={shelfView === "materials" ? "selected" : ""}
                onClick={() => setShelfView("materials")}
              >
                Materials
              </button>
              <button
                className={shelfView === "wishlist" ? "selected" : ""}
                onClick={() => setShelfView("wishlist")}
              >
                Want to Try
              </button>
              <button
                className={shelfView === "recipes" ? "selected" : ""}
                onClick={() => setShelfView("recipes")}
              >
                Recipes
              </button>
            </div>
            {shelfView === "materials" && (
              <>
                <div className="shelf-actions">
                  {currentStudio && (
                    <button
                      className="btn studio-shelf-link"
                      onClick={() => openStudio(currentStudio.studio_id)}
                    >
                      <span>
                        {currentStudio.photo_url ? (
                          <img className="studio-shelf-link-photo" src={currentStudio.photo_url} alt="" />
                        ) : (
                          <Layers size={18} />
                        )}
                        Open {currentStudio.name} Shelf
                      </span>
                      <ArrowRight size={18} />
                    </button>
                  )}
                  <button
                    className="btn shelf-add-button"
                    onClick={() => openFinder("all")}
                  >
                    <span>
                      <Plus size={19} /> Add to My Shelf
                    </span>
                    <ArrowRight size={18} />
                  </button>
                  <button
                    className="btn shelf-effect-button"
                    onClick={() => openUnderglazeFinder("all")}
                  >
                    <Plus size={18} /> Add Underglazes
                  </button>
                  <button
                    className="btn shelf-effect-button"
                    onClick={() => openFinder("mine")}
                  >
                    <Search size={18} /> Search My Shelf by Effect
                  </button>
                </div>
                <section className="card shelf-tools">
                  <label className="field-label" htmlFor="shelf-query">
                    Search your materials
                  </label>
                  <div className="shelf-search-row">
                    <span className="shelf-search-input">
                      <Search size={18} />
                      <input
                        id="shelf-query"
                        value={shelfQuery}
                        placeholder="Glaze, underglaze, clay, brand, or code"
                        onChange={(e) => setShelfQuery(e.target.value)}
                      />
                      {shelfQuery && (
                        <button type="button" onClick={() => setShelfQuery("")}>
                          Clear
                        </button>
                      )}
                    </span>
                    <select
                      className="select shelf-sort"
                      aria-label="Sort shelf"
                      value={shelfSort}
                      onChange={(e) => setShelfSort(e.target.value)}
                    >
                      <option value="name">A–Z</option>
                      <option value="brand">Brand</option>
                      <option value="recent">Recent</option>
                    </select>
                  </div>
                  <details className="shelf-filter-details">
                    <summary>
                      Filters {shelfFiltersActive ? "• Active" : ""}
                    </summary>
                    <div className="shelf-filter-grid">
                      <label>
                        Type
                        <select
                          className="select"
                          value={shelfTypeFilter}
                          onChange={(e) => setShelfTypeFilter(e.target.value)}
                        >
                          <option value="all">All materials</option>
                          <option value="glaze">Glazes</option>
                          <option value="underglaze">Underglazes</option>
                          <option value="clay">Clay</option>
                        </select>
                      </label>
                      <label>
                        Brand
                        <select
                          className="select"
                          value={shelfBrandFilter}
                          onChange={(e) => setShelfBrandFilter(e.target.value)}
                        >
                          <option value="all">All brands</option>
                          {shelfBrands.map((brand) => (
                            <option key={String(brand)} value={String(brand)}>
                              {String(brand)}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label>
                        Cone
                        <select
                          className="select"
                          value={shelfConeFilter}
                          onChange={(e) => setShelfConeFilter(e.target.value)}
                        >
                          <option value="all">Any cone</option>
                          {[5, 6, 7, 8, 9, 10].map((value) => (
                            <option key={value} value={value}>Cone {value}</option>
                          ))}
                        </select>
                      </label>
                      <label>
                        Stock
                        <select
                          className="select"
                          value={shelfStockFilter}
                          onChange={(e) => setShelfStockFilter(e.target.value)}
                        >
                          <option value="all">Any stock</option>
                          <option value="low">Low stock only</option>
                        </select>
                      </label>
                    </div>
                    {shelfFiltersActive && (
                      <button className="shelf-clear-filters" onClick={clearShelfFilters}>
                        Clear all filters
                      </button>
                    )}
                  </details>
                  <div className="shelf-count">
                    <strong>{visibleShelfMaterials.length}</strong>
                    <span>
                      {visibleShelfMaterials.length === 1 ? "material" : "materials"}
                    </span>
                  </div>
                </section>
                {ownedMaterials.length === 0 && (
                  <div className="card shelf-empty">
                    <strong>Your shelf is ready.</strong>
                    <p className="muted">
                      Add your first glaze, underglaze, or clay body above.
                    </p>
                  </div>
                )}
                {ownedMaterials.length > 0 && visibleShelfMaterials.length === 0 && (
                  <div className="card shelf-empty">
                    <strong>No materials match those filters.</strong>
                    <button className="shelf-clear-filters" onClick={clearShelfFilters}>
                      Clear filters
                    </button>
                  </div>
                )}
                <details className="material-list-details">
                  <summary>
                    <span>My shelf materials</span>
                    <span>{visibleShelfMaterials.length} {visibleShelfMaterials.length === 1 ? "material" : "materials"}</span>
                  </summary>
                  <div className="material-list-scroll">
                {visibleShelfMaterials.map((x) => (
                  <div className="item material-card" key={x.item_type + x.item_id}>
                    <div className="row material-card-heading">
                      <div>
                        <strong>{x.item_name}</strong>
                        <div className="muted">
                          {x.manufacturer} • {x.item_type}
                          {x.sku_or_code ? ` • ${x.sku_or_code}` : ""}
                        </div>
                      </div>
                      {x.personalStatus === "low" || x.studioStatus === "low" ? (
                        <span className="stock-badge low">Low stock</span>
                      ) : null}
                    </div>
                    <div className="shelf-locations">
                      {x.onMyShelf && <span className="location-badge personal">My Shelf</span>}
                      {x.onStudioShelf && <span className="location-badge studio">Studio Shelf</span>}
                    </div>
                    {(x.personalQuantity != null || x.personalContainerSize || x.personalNotes) && (
                      <div className="inventory-summary">
                        {x.personalQuantity != null && <span>{x.personalQuantity} on hand</span>}
                        {x.personalContainerSize && <span>{x.personalContainerSize}</span>}
                        {x.personalNotes && <p>{x.personalNotes}</p>}
                      </div>
                    )}
                    <div className="material-actions">
                      {x.item_type === "glaze" && (
                        <button className="detail-link" onClick={() => openGlazeDetail(x)}>
                          View Details <ArrowRight size={16} />
                        </button>
                      )}
                      {x.item_type === "underglaze" && (
                        <button className="detail-link" onClick={() => openMaterialDetail(x)}>
                          View Details <ArrowRight size={16} />
                        </button>
                      )}
                      {x.onMyShelf && (
                        <button className="inventory-edit" onClick={() => openInventoryEditor(x, "mine")}>
                          Edit My Inventory
                        </button>
                      )}
                      {x.onStudioShelf && canEditStudio && (
                        <button className="inventory-edit studio" onClick={() => openInventoryEditor(x, "studio")}>
                          Edit Studio
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                  </div>
                </details>
              </>
            )}
            {shelfView === "wishlist" && (
              <>
                <div className="wishlist-intro">
                  <strong>{wantToTryMaterials.length} saved</strong>
                  <p>Glazes you want to remember before adding them to your shelf.</p>
                </div>
                {wantToTryMaterials.length === 0 && (
                  <div className="card shelf-empty">
                    <strong>Your Want to Try list is open.</strong>
                    <p className="muted">Save interesting glazes from Finder and they’ll appear here.</p>
                    <button className="btn secondary" onClick={() => openFinder("all")}>
                      Find Glazes
                    </button>
                  </div>
                )}
                {wantToTryMaterials.map((x) => (
                  <div className="item material-card wishlist-card" key={x.item_id}>
                    <div className="row material-card-heading">
                      <div>
                        <strong>{x.item_name}</strong>
                        <div className="muted">{x.manufacturer} • {x.sku_or_code || "glaze"}</div>
                      </div>
                      <span className="location-badge wishlist">Want to Try</span>
                    </div>
                    {x.personalNotes && <p className="inventory-note">{x.personalNotes}</p>}
                    <div className="material-actions">
                      <button className="detail-link" onClick={() => openGlazeDetail(x)}>
                        View Details <ArrowRight size={16} />
                      </button>
                      <button className="inventory-edit" onClick={() => mine(x)}>
                        Move to My Shelf
                      </button>
                      <button className="inventory-edit" onClick={() => openInventoryEditor(x, "mine")}>
                        Edit
                      </button>
                    </div>
                  </div>
                ))}
              </>
            )}
            {shelfView === "recipes" && (
              <>
                {currentStudio && (
                  <button className="btn secondary studio-shelf-link" onClick={openStudioRecipes}>
                    <span>View {currentStudio.name}'s Shared Recipes</span>
                    <ArrowRight size={16} />
                  </button>
                )}
                {recipes.length === 0 && (
                  <div className="card">
                    <strong>No saved recipes yet.</strong>
                    <p className="muted">
                      Build and analyze a combination, then save it here.
                    </p>
                  </div>
                )}
                {recipes.map((r) => (
                  <details className="item recipe-card" key={r.recipe_id}>
                    <summary className="recipe-card-summary">
                      <div>
                        <strong>{r.name}</strong>
                        <div className="muted">
                          {r.clay_name || "No clay selected"} • Cone {r.cone}
                        </div>
                      </div>
                      {r.prediction_movement_risk != null ? (
                        <span className="prediction-risk">
                          Risk {r.prediction_movement_risk}/10
                        </span>
                      ) : (
                        <span className="tag">Saved recipe</span>
                      )}
                    </summary>
                    <div className="recipe-card-stats">
                      <span>
                        <strong>{r.layer_count}</strong>{" "}
                        {Number(r.layer_count) === 1 ? "layer" : "layers"}
                      </span>
                      <span>
                        <strong>{r.firing_count || 0}</strong>{" "}
                        {Number(r.firing_count) === 1 ? "firing" : "firings"}
                      </span>
                      {r.latest_rating && (
                        <span><strong>{r.latest_rating}/5</strong> latest</span>
                      )}
                    </div>
                    {r.prediction_verdict && (
                      <div className="recipe-prediction-preview">
                        <span className="eyebrow">PREDICTION</span>
                        <strong>{r.prediction_verdict}</strong>
                      </div>
                    )}
                    {r.goal && <p className="recipe-goal">{r.goal}</p>}
                    <div className="grid">
                      <button
                        className="btn secondary"
                        onClick={() => openRecipe(r.recipe_id)}
                      >
                        View Recipe
                      </button>
                      <button
                        className="btn primary"
                        onClick={() => startFiring(r.recipe_id, r.cone)}
                      >
                        Start Firing Log
                      </button>
                    </div>
                    {currentStudio && (
                      <button
                        className={"btn " + (r.shared_studio_id ? "is-shared" : "ghost") + " firing-share-button"}
                        disabled={sharingRecipeId === r.recipe_id}
                        onClick={() =>
                          toggleRecipeStudioShare(r.recipe_id, !!r.shared_studio_id)
                        }
                      >
                        {sharingRecipeId === r.recipe_id
                          ? "Updating…"
                          : r.shared_studio_id
                            ? `Remove from ${currentStudio.name}`
                            : `Share with ${currentStudio.name}`}
                      </button>
                    )}
                    <button
                      className="btn delete-btn"
                      onClick={() => deleteRecipe(r.recipe_id, r.name)}
                    >
                      Delete Recipe
                    </button>
                  </details>
                ))}
              </>
            )}
          </>
        )}
        {tab === "find" && (
          <>
            {msg && (
              <div
                className="notice finder-notice"
                role="status"
                aria-live="polite"
              >
                {msg}
              </div>
            )}
            <section className="hero finder-hero">
              <span className="eyebrow">MATERIAL DISCOVERY</span>
              <h1>
                {kind === "glaze"
                  ? "Find Glazes"
                  : kind === "underglaze"
                    ? "Find Underglazes"
                    : "Find Clay"}
              </h1>
              {kind === "glaze" && (
                <p>Quickly find a glaze, or explore by effect.</p>
              )}
              {kind === "underglaze" && (
                <p>Find stable decorative colors for painting and surface design.</p>
              )}
            </section>
            <div className="grid finder-kind-grid">
              <button
                className={
                  "btn finder-kind-button " +
                  (kind === "glaze" ? "primary" : "ghost")
                }
                onClick={() => {
                  setKind("glaze");
                  setResults([]);
                  setHasMoreResults(false);
                  setSearchStarted(false);
                }}
              >
                Glazes
              </button>
              <button
                className={
                  "btn finder-kind-button " +
                  (kind === "underglaze" ? "primary" : "ghost")
                }
                onClick={() => {
                  setKind("underglaze");
                  setResults([]);
                  setHasMoreResults(false);
                  setSearchStarted(false);
                }}
              >
                Underglazes
              </button>
              <button
                className={
                  "btn finder-kind-button " +
                  (kind === "clay" ? "primary" : "ghost")
                }
                onClick={() => {
                  setKind("clay");
                  setResults([]);
                  setHasMoreResults(false);
                  setSearchStarted(false);
                }}
              >
                Clay
              </button>
            </div>
            {kind === "glaze" ? (
              <>
                <form
                  className="quick-glaze-search"
                  onSubmit={(e) => {
                    e.preventDefault();
                    search(true);
                  }}
                >
                  <label htmlFor="quick-glaze-query">Search glazes</label>
                  <div className="quick-search-row">
                    <div className="quick-search-input">
                      <Search size={20} />
                      <input
                        id="quick-glaze-query"
                        aria-label="Search glaze name, brand, or code"
                        placeholder="Glaze name, brand, or code"
                        enterKeyHint="search"
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                      />
                      {(q ||
                        effectSearch ||
                        colorSearch ||
                        finderCone ||
                        searchStarted) && (
                        <button
                          className="quick-search-clear"
                          type="button"
                          aria-label="Clear glaze search"
                          onClick={clearFinderSearch}
                        >
                          <span aria-hidden="true">×</span>
                          <span>Clear</span>
                        </button>
                      )}
                    </div>
                    <button
                      className="btn quick-search-button"
                      type="submit"
                      aria-label="Search glazes"
                    >
                      {searching ? "…" : "Search"}
                    </button>
                  </div>
                  <label className="quick-scope-control">
                    <span>Search in</span>
                    <select
                      value={searchScope}
                      aria-label="Choose which glaze shelf to search"
                      onChange={(e) => {
                        setSearchScope(e.target.value);
                        setResults([]);
                        setHasMoreResults(false);
                        setSearchStarted(false);
                        setMsg("");
                      }}
                    >
                      <option value="all">All Glazes</option>
                      <option value="available" disabled={!studio}>
                        {studio
                          ? "My + Studio Shelves"
                          : "My + Studio Shelves — connect a studio"}
                      </option>
                      <option value="mine">My Shelf</option>
                      <option value="studio" disabled={!studio}>
                        {studio ? "Studio Shelf" : "Studio Shelf — connect a studio"}
                      </option>
                    </select>
                  </label>
                </form>
                <details className="finder-advanced">
                  <summary>
                    <span>Effect, color &amp; cone filters</span>
                    <small>Optional</small>
                  </summary>
                  <form
                    className="finder-form"
                    onSubmit={(e) => {
                      e.preventDefault();
                      search();
                    }}
                  >
                    <div className="finder-card effect-card">
                      <label className="field-label">
                        Desired Effect
                        <input
                          className="input"
                          placeholder="e.g., waterfall, drippy, pools"
                          enterKeyHint="search"
                          value={effectSearch}
                          onChange={(e) => setEffectSearch(e.target.value)}
                        />
                      </label>
                      <div className="effect-chips">
                        {effectOptions.map((effect) => (
                          <button
                            type="button"
                            key={effect}
                            className={
                              "filter-chip " +
                              (effectSearch.toLowerCase() ===
                              effect.toLowerCase()
                                ? "selected"
                                : "")
                            }
                            onClick={() =>
                              setEffectSearch(
                                effectSearch.toLowerCase() ===
                                  effect.toLowerCase()
                                  ? ""
                                  : effect,
                              )
                            }
                          >
                            {effect}
                          </button>
                        ))}
                      </div>
                      <div className="filter-grid">
                        <label className="field-label">
                          Color
                          <select
                            className="select"
                            value={colorSearch}
                            onChange={(e) => setColorSearch(e.target.value)}
                          >
                            <option value="">Any color</option>
                            {colorOptions.map((color) => (
                              <option key={color} value={color}>
                                {color}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="field-label">
                          Firing Cone
                          <select
                            className="select"
                            value={finderCone}
                            onChange={(e) => setFinderCone(e.target.value)}
                          >
                            <option value="">Any cone</option>
                            {[5, 6, 7, 8, 9, 10].map((value) => (
                              <option key={value} value={value}>
                                Cone {value}
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>
                      <button className="btn finder-submit" type="submit">
                        <Search size={18} />
                        {searching ? "Searching…" : "Find Glaze Suggestions"}
                      </button>
                    </div>
                  </form>
                </details>
              </>
            ) : kind === "underglaze" ? (
              <form
                className="quick-glaze-search"
                onSubmit={(e) => {
                  e.preventDefault();
                  search(true);
                }}
              >
                <label htmlFor="quick-underglaze-query">Search underglazes</label>
                <div className="quick-search-row">
                  <div className="quick-search-input">
                    <Search size={20} />
                    <input
                      id="quick-underglaze-query"
                      aria-label="Search underglaze name, brand, or code"
                      placeholder="Underglaze name, brand, or code"
                      enterKeyHint="search"
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                    />
                    {(q || searchStarted) && (
                      <button className="quick-search-clear" type="button" onClick={clearFinderSearch}>
                        <span aria-hidden="true">×</span><span>Clear</span>
                      </button>
                    )}
                  </div>
                  <button className="btn quick-search-button" type="submit">
                    {searching ? "…" : "Search"}
                  </button>
                </div>
                <label className="quick-scope-control">
                  <span>Search in</span>
                  <select
                    value={searchScope}
                    aria-label="Choose which underglaze shelf to search"
                    onChange={(e) => {
                      setSearchScope(e.target.value);
                      setResults([]);
                      setHasMoreResults(false);
                      setSearchStarted(false);
                    }}
                  >
                    <option value="all">All Underglazes</option>
                    <option value="available" disabled={!studio}>My + Studio Shelves</option>
                    <option value="mine">My Shelf</option>
                    <option value="studio" disabled={!studio}>Studio Shelf</option>
                  </select>
                </label>
                <p className="muted">
                  Underglazes stay separate from glaze movement and layering predictions.
                </p>
              </form>
            ) : (
              <form
                className="row search-row"
                onSubmit={(e) => {
                  e.preventDefault();
                  search();
                }}
              >
                <input
                  className="input"
                  aria-label="Search clay"
                  placeholder="Search clay bodies"
                  enterKeyHint="search"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
                <button
                  className="btn primary search-action"
                  type="submit"
                  aria-label="Search"
                >
                  <Search size={17} />
                </button>
              </form>
            )}
            {searchStarted && (
              <div className="results-heading">
                <strong>
                  {results.length}{hasMoreResults ? "+" : ""} {results.length === 1 ? "match" : "matches"}
                </strong>
                <span>
                  {kind === "glaze" || kind === "underglaze"
                    ? searchScope === "mine"
                      ? "on My Shelf"
                      : searchScope === "studio"
                        ? "on Studio Shelf"
                        : searchScope === "available"
                          ? "on My + Studio Shelves"
                        : kind === "underglaze" ? "in All Underglazes" : "in All Glazes"
                    : "for clay"}
                </span>
              </div>
            )}
            {searchStarted && !searching && results.length === 0 && (
              <div className="card finder-empty">
                <strong>No exact matches yet.</strong>
                <p className="muted">
                  {kind === "glaze"
                    ? "Try a broader effect such as “fluid,” remove the color, or search All Glazes."
                    : "Try a broader name, brand, or product code."}
                </p>
              </div>
            )}
            {results.map((x) => (
              <div className="item finder-result" key={resultKey(x)}>
                <div className="row result-title">
                  <div>
                    <strong>{x.glaze_name || x.clay_name || x.material_name || x.name}</strong>
                    <div className="muted">
                      {x.manufacturer}
                      {displayMaterialSku(x.sku) ? ` • ${displayMaterialSku(x.sku)}` : ""}
                    </div>
                  </div>
                  <span className="location-badge search-access">
                    {accessLabel(x)}
                  </span>
                </div>
                {kind === "glaze" && (
                  <>
                    <div className="result-tags">
                      {x.color_family && <span>{x.color_family}</span>}
                      {x.our_type && <span>{x.our_type}</span>}
                      {x.finish && <span>{x.finish}</span>}
                      {x.run_risk >= 4 && <span>Strong movement</span>}
                      {x.run_risk != null && x.run_risk <= 2 && (
                        <span>Stable</span>
                      )}
                      {x.layer_reactivity >= 4 && (
                        <span>Reactive layering</span>
                      )}
                    </div>
                    <button
                      className="detail-link"
                      type="button"
                      onClick={() => openGlazeDetail(x)}
                    >
                      View glaze details <ArrowRight size={16} />
                    </button>
                  </>
                )}
                {kind === "underglaze" && (
                  <>
                    <div className="result-tags">
                      <span>Underglaze</span>
                      {x.opacity && <span>{x.opacity}</span>}
                      {x.firing_range && <span>{x.firing_range}</span>}
                    </div>
                    <button className="detail-link" type="button" onClick={() => openMaterialDetail(x)}>
                      View underglaze details <ArrowRight size={16} />
                    </button>
                  </>
                )}
                <div className={kind !== "clay" ? "finder-shelf-actions" : "grid"}>
                  <button
                    className={
                      "btn shelf-state-button " +
                      (isOnMyShelf(x) ? "is-added" : "clay")
                    }
                    disabled={
                      isOnMyShelf(x) ||
                      addingShelfKey === `${resultKey(x)}:mine`
                    }
                    onClick={() => mine(x)}
                  >
                    {isOnMyShelf(x)
                      ? "Added ✓"
                      : addingShelfKey === `${resultKey(x)}:mine`
                        ? "Adding…"
                        : "+ My Shelf"}
                  </button>
                  {kind === "glaze" && (
                    <button
                      className={
                        "btn shelf-state-button " +
                        (isWishlisted(x) ? "is-wishlisted" : "secondary")
                      }
                      disabled={
                        isOnMyShelf(x) ||
                        isWishlisted(x) ||
                        addingShelfKey === `${resultKey(x)}:wishlist`
                      }
                      onClick={() => wantToTry(x)}
                    >
                      {isOnMyShelf(x)
                        ? "On My Shelf"
                        : isWishlisted(x)
                          ? "Saved ✓"
                          : addingShelfKey === `${resultKey(x)}:wishlist`
                            ? "Saving…"
                            : "Want to Try"}
                    </button>
                  )}
                  <button
                    className={
                      "btn shelf-state-button " +
                      (isOnStudioShelf(x) ? "is-added studio-added" : "secondary")
                    }
                    disabled={
                      !studio ||
                      isOnStudioShelf(x) ||
                      addingShelfKey === `${resultKey(x)}:studio`
                    }
                    onClick={() => studioAdd(x)}
                  >
                    {isOnStudioShelf(x)
                      ? "Added ✓"
                      : addingShelfKey === `${resultKey(x)}:studio`
                        ? "Adding…"
                        : "+ Studio"}
                  </button>
                </div>
                {kind !== "underglaze" && (
                  <button
                    className="btn ghost"
                    style={{ width: "100%", marginTop: 7 }}
                    onClick={() =>
                      kind === "glaze"
                        ? addShelfGlazeToBuild(x)
                        : (setClay(x), setAnalysis(null), setTab("build"))
                    }
                  >
                    {kind === "glaze" ? "Add to Build" : "Use as Clay"}
                  </button>
                )}
              </div>
            ))}
            {searchStarted && results.length > 0 && hasMoreResults && (
              <button
                className="btn secondary finder-load-more"
                type="button"
                disabled={searching}
                onClick={() => search(lastSearchQuick, true)}
              >
                {searching ? "Loading…" : "Load 24 more"}
              </button>
            )}
          </>
        )}
        {tab === "explore" && (
          <>
            {msg && (
              <div className="notice explore-notice" role="status" aria-live="polite">
                {msg}
              </div>
            )}
            <section className="hero explore-hero">
              <span className="eyebrow">COMMUNITY FIRINGS</span>
              <h1>Explore Results</h1>
              <p>See glaze combinations, photos, and kiln notes that potters chose to share.</p>
            </section>
            <form
              className="card explore-search-card"
              onSubmit={(e) => {
                e.preventDefault();
                searchExplore();
              }}
            >
              <label className="field-label">
                Glaze or Clay
                <div className="explore-query-row">
                  <Search size={20} />
                  <input
                    className="input"
                    placeholder="Search a glaze, clay, or color"
                    value={exploreQuery}
                    onChange={(e) => setExploreQuery(e.target.value)}
                    enterKeyHint="search"
                  />
                </div>
              </label>
              <div className="explore-filter-grid">
                <label className="field-label">
                  Effect
                  <select className="select" value={exploreEffect} onChange={(e) => setExploreEffect(e.target.value)}>
                    <option value="">Any effect</option>
                    {effectOptions.map((effect) => <option key={effect} value={effect}>{effect}</option>)}
                  </select>
                </label>
                <label className="field-label">
                  Cone
                  <select className="select" value={exploreCone} onChange={(e) => setExploreCone(e.target.value)}>
                    <option value="">Any cone</option>
                    {[5, 6, 7, 8, 9, 10].map((value) => <option key={value} value={value}>Cone {value}</option>)}
                  </select>
                </label>
                <label className="field-label">
                  Rating
                  <select className="select" value={exploreRating} onChange={(e) => setExploreRating(e.target.value)}>
                    <option value="">Any rating</option>
                    <option value="4">4 stars &amp; up</option>
                    <option value="5">5 stars</option>
                  </select>
                </label>
              </div>
              <div className="explore-search-actions">
                <button className="btn primary" type="submit">
                  <Search size={17} />
                  {exploreLoading ? "Searching…" : "Search Results"}
                </button>
                <button className="btn ghost" type="button" onClick={clearExplore}>Clear</button>
              </div>
            </form>
            <div className="explore-results-heading">
              <strong>
                {exploreLoading
                  ? "Loading shared firings…"
                  : exploreResults.length + " shared " + (exploreResults.length === 1 ? "result" : "results")}
              </strong>
              <span>Private by default</span>
            </div>
            {!exploreLoading && exploreStarted && exploreResults.length === 0 && (
              <div className="card explore-empty">
                <Compass size={28} />
                <strong>No shared firings match yet.</strong>
                <p className="muted">Clear a filter, or be the first to share a firing result from your Journal.</p>
                <button className="btn secondary" type="button" onClick={() => setTab("journal")}>Open Firing Journal</button>
              </div>
            )}
            <div className="explore-grid">
              {exploreResults.map((item) => (
                <article className="explore-card" key={item.firing_id}>
                  <div className="explore-photo-wrap">
                    {item.primaryPhotoUrl ? (
                      <img src={item.primaryPhotoUrl} alt={(item.recipe_name || "Glaze") + " firing result"} />
                    ) : (
                      <div className="explore-photo-placeholder"><Compass size={28} /></div>
                    )}
                    {Number(item.photo_count) > 1 && <span className="explore-photo-count">{item.photo_count} photos</span>}
                  </div>
                  <div className="explore-card-body">
                    <div className="row explore-card-heading">
                      <div>
                        <strong>{item.recipe_name || "Shared firing"}</strong>
                        <small>
                          {item.clay_name || "Clay not listed"}
                          {item.cone != null ? " · Cone " + item.cone : ""}
                        </small>
                      </div>
                      <span className="explore-rating">{item.rating || "—"}/5</span>
                    </div>
                    {(item.layers?.length > 0 || item.color_result || item.surface_result || item.movement_result || item.notes) && (
                      <details className="explore-card-extra">
                        <summary>Recipe &amp; result details</summary>
                        {Array.isArray(item.layers) && item.layers.length > 0 && (
                          <div className="explore-layer-list">
                            {item.layers.map((layer: any, index: number) => (
                              <span key={(layer.glaze_id || layer.glaze_name || "layer") + index}>
                                {layer.glaze_name}{layer.coats ? " · " + layer.coats + " coats" : ""}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="explore-result-chips">
                          {item.color_result && <span>{item.color_result}</span>}
                          {item.surface_result && <span>{item.surface_result}</span>}
                          {item.movement_result && <span>{item.movement_result}</span>}
                        </div>
                        {item.notes && <p>{item.notes}</p>}
                      </details>
                    )}
                    <button className="btn secondary explore-detail-button" type="button" onClick={() => openFiringDetail(item.firing_id)}>
                      View Firing Details <ArrowRight size={16} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
            <div className="explore-privacy-note">
              <ShieldCheck size={21} />
              <p><strong>Sharing is always optional.</strong> Only firings deliberately shared from the Journal appear here. Account names and emails are not shown.</p>
            </div>
          </>
        )}
        {tab === "build" && (
          <>
            <section className="hero builder-hero">
              <span className="eyebrow">YOUR VISION</span>
              <h1>Combination Builder</h1>
              <p className="builder-description">Build, layer, analyze your glaze combination.</p>
            </section>

            <label className="field-label project-field">
              Project Description
              <input
                className="input"
                placeholder="e.g., Bowl with chatter lines"
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
              />
            </label>

            <div className="builder-context-grid">
              <label className="field-label">
                Project Orientation
                <select
                  className="select"
                  value={orientation}
                  onChange={(e) => {
                    setOrientation(e.target.value);
                    setAnalysis(null);
                  }}
                >
                  <option value="vertical">Vertical — bowl, mug, vase</option>
                  <option value="horizontal">
                    Horizontal — plate, platter, tile
                  </option>
                  <option value="sculptural">Sculptural / mixed angles</option>
                </select>
              </label>
              <label className="field-label">
                Surface Texture
                <select
                  className="select"
                  value={texture}
                  onChange={(e) => {
                    setTexture(e.target.value);
                    setAnalysis(null);
                  }}
                >
                  <option value="smooth">Smooth</option>
                  <option value="carved">Carved</option>
                  <option value="chattered">Chattered</option>
                  <option value="textured">Textured</option>
                  <option value="groggy">Groggy / coarse clay</option>
                </select>
              </label>
            </div>

            {recipes.length > 0 && (
              <label className="field-label">
                Load a Saved Recipe
                <select
                  className="select"
                  value=""
                  onChange={(e) => loadRecipeIntoBuilder(e.target.value)}
                >
                  <option value="">Start fresh, or choose a recipe…</option>
                  {recipes.map((r) => (
                    <option key={r.recipe_id} value={r.recipe_id}>
                      {r.name?.trim() || "Untitled recipe"}
                    </option>
                  ))}
                </select>
              </label>
            )}

            {editingRecipeId && (
              <div className="card recipe-editing-banner">
                <div>
                  <span className="eyebrow">CORRECTING A SAVED RECIPE</span>
                  <strong>{recipeName || "This recipe"}</strong>
                </div>
                <div className="recipe-editing-actions">
                  <button className="btn primary" onClick={updateRecipe}>
                    Update Recipe
                  </button>
                  <button
                    className="btn ghost"
                    onClick={() => setEditingRecipeId("")}
                  >
                    Stop Editing
                  </button>
                </div>
              </div>
            )}

            <button
              className="btn clay-select-button"
              style={{ width: "100%", marginBottom: 8 }}
              onClick={() => {
                setKind("clay");
                setQ("");
                setResults([]);
                setHasMoreResults(false);
                setTab("find");
              }}
            >
              {clay?.clay_name ? `Clay: ${clay.clay_name}` : "+ Select Clay"}
            </button>

            <button
              className="btn secondary"
              style={{ width: "100%", marginBottom: 8 }}
              onClick={() => openFinder("all", true)}
            >
              {layers.length === 0
                ? "+ Select Base Glaze"
                : "+ Add Another Glaze"}
            </button>

            {layers.map((x, i) => (
              <div className="item" key={i}>
                <div className="row">
                  <div>
                    <span className="muted">
                      {i === 0 ? "Base glaze" : `Layer ${i + 1}`}
                    </span>
                    <br />
                    <strong>{x.glaze_name}</strong>
                    <div className="muted">{x.manufacturer}</div>
                    <div className="layer-controls">
                      <label>
                        Coats
                        <select
                          className="mini-select"
                          value={x.coats}
                          onChange={(e) => {
                            const next = [...layers];
                            next[i] = { ...next[i], coats: +e.target.value };
                            setLayers(next);
                            setAnalysis(null);
                          }}
                        >
                          <option value="1">1</option>
                          <option value="2">2</option>
                          <option value="3">3</option>
                          <option value="4">4</option>
                        </select>
                      </label>
                      <label>
                        Surface
                        <select
                          className="mini-select"
                          value={x.surface || "inside & outside"}
                          onChange={(e) => {
                            const next = [...layers];
                            next[i] = { ...next[i], surface: e.target.value };
                            setLayers(next);
                            setAnalysis(null);
                          }}
                        >
                          <option value="outside">Outside</option>
                          <option value="inside">Inside</option>
                          <option value="inside & outside">
                            Inside &amp; Outside
                          </option>
                        </select>
                      </label>
                      <label>
                        Placement
                        <select
                          className="mini-select"
                          value={
                            usesCustomPlacement(x)
                              ? "custom"
                              : x.placement || "overall"
                          }
                          onChange={(e) => {
                            const next = [...layers];
                            next[i] = {
                              ...next[i],
                              placement:
                                e.target.value === "custom"
                                  ? ""
                                  : e.target.value,
                              placementMode:
                                e.target.value === "custom"
                                  ? "custom"
                                  : "preset",
                            };
                            setLayers(next);
                            setAnalysis(null);
                          }}
                        >
                          <option value="overall">Overall</option>
                          <option value="top half">Top half</option>
                          <option value="bottom half">Bottom half</option>
                          <option value="rim">Rim</option>
                          <option value="design only">Design only</option>
                          <option value="overlapping band">
                            Overlapping band
                          </option>
                          <option value="custom">Custom placement…</option>
                        </select>
                      </label>
                    </div>
                    {usesCustomPlacement(x) && (
                      <label className="custom-placement">
                        Custom Placement
                        <input
                          className="mini-select"
                          placeholder="Describe where this glaze goes"
                          value={x.placement || ""}
                          onChange={(e) => {
                            const next = [...layers];
                            next[i] = {
                              ...next[i],
                              placement: e.target.value,
                              placementMode: "custom",
                            };
                            setLayers(next);
                            setAnalysis(null);
                          }}
                        />
                      </label>
                    )}
                  </div>

                  <button
                    className="nav"
                    onClick={() => setLayers(layers.filter((_, j) => j !== i))}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}

            <div className="builder-finder-card">
              <div>
                <span className="eyebrow">NEED INSPIRATION?</span>
                <strong>Find a glaze by effect or color</strong>
                <p>
                  Try waterfall, drippy, pooling, stable, turquoise, and more.
                </p>
              </div>
              <button
                className="btn builder-finder-button"
                onClick={() => openFinder("all", true)}
              >
                <Search size={18} /> Find Suggestions
              </button>
            </div>

            <label className="field-label">
              Firing Cone
              <select
                className="select"
                value={cone}
                onChange={(e) => {
                  setCone(+e.target.value);
                  setAnalysis(null);
                }}
              >
                <option value="5">Cone 5</option>
                <option value="6">Cone 6</option>
                <option value="7">Cone 7</option>
                <option value="8">Cone 8</option>
                <option value="9">Cone 9</option>
                <option value="10">Cone 10</option>
              </select>
            </label>

            <textarea
              className="textarea"
              placeholder="Desired effect"
              value={goal}
              onChange={(e) => {
                setGoal(e.target.value);
                setAnalysis(null);
              }}
              style={{ marginTop: 8 }}
            />

            <button
              className="btn primary"
              style={{ width: "100%", marginTop: 8 }}
              onClick={() => {
                if (layers.length === 0) {
                  setMsg("Add at least one glaze before analyzing.");
                  return;
                }
                analyze();
              }}
            >
              Analyze Combination
            </button>

            {analysis && (
              <div className="card result">
                <div className="analysis-heading">
                  <span className="eyebrow">STACK ANALYSIS</span>
                  <strong>{analysis.verdict}</strong>
                  <span className="analysis-risk">
                    Movement risk {analysis.movement_risk}/10
                  </span>
                </div>
                <div className="analysis-grid">
                  <div>
                    <span>Effect match</span>
                    <strong>{analysis.effect_match}</strong>
                  </div>
                  <div>
                    <span>Food-contact guidance</span>
                    <strong>{analysis.food_contact_guidance}</strong>
                  </div>
                  <div>
                    <span>Cone compatibility</span>
                    <strong>{analysis.compatibility}</strong>
                  </div>
                  <div>
                    <span>Clay influence</span>
                    <strong>{analysis.clay_influence}</strong>
                  </div>
                </div>
                {analysis.warnings?.length > 0 && (
                  <div className="analysis-warnings">
                    <strong>Before you fire</strong>
                    <ul>
                      {analysis.warnings.map((warning: string, i: number) => (
                        <li key={i}>{warning}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <p className="analysis-rationale">{analysis.rationale}</p>
                <p className="analysis-confidence">{analysis.confidence}</p>
                <input
                  className="input"
                  placeholder="Name this recipe"
                  value={recipeName}
                  onChange={(e) => setRecipeName(e.target.value)}
                />
                <div className="analysis-actions">
                  <button className="btn secondary" onClick={() => saveRecipe(false)}>
                    Save Recipe
                  </button>
                  <button className="btn primary" onClick={() => saveRecipe(true)}>
                    Save &amp; Log a Firing
                  </button>
                </div>
              </div>
            )}
          </>
        )}
        {tab === "journal" && (
          <>
            <section className="hero journal-hero">
              <span className="eyebrow">TEST. FIRE. LEARN.</span>
              <h1>Firing Journal</h1>
              <p>Save what happened so every firing makes the next one smarter.</p>
            </section>
            <button className="btn explore-firings-button" onClick={openExplore}>
              <Compass size={18} /> Explore Shared Firings
            </button>
            <details
              className="card journal-entry-panel"
              open={journalFormOpen}
              onToggle={(event) => {
                const open = event.currentTarget.open;
                setJournalFormOpen(open);
                if (!open) {
                  setCompletingFiringId("");
                  setEditingHadResult(false);
                }
              }}
            >
              <summary className="journal-entry-summary">
                <span>
                  <strong>
                    {completingFiringId
                      ? editingHadResult
                        ? "Edit This Firing"
                        : "Update or Complete This Firing"
                      : "Log a New Firing"}
                  </strong>
                  <small>
                    {completingFiringId
                      ? editingHadResult
                        ? "Update results or add more photos"
                        : "Save your changes, or complete it once it's fired"
                      : "Recipe, kiln details, results, and photos"}
                  </small>
                </span>
                <span className="journal-entry-toggle">
                  {journalFormOpen ? "Close" : "+ Add Firing"}
                </span>
              </summary>
              <div className="stack journal-card journal-form-body">
              <span className="journal-step">1 · Firing setup</span>
              <label className="field-label">
                Recipe
                <select
                  className="select"
                  value={recipe}
                  disabled={!!completingFiringId}
                  onChange={(e) => {
                    setRecipe(e.target.value);
                    const chosen = recipes.find(
                      (r) => r.recipe_id === e.target.value,
                    );
                    if (chosen?.cone) setCone(Number(chosen.cone));
                  }}
                >
                  <option value="">Choose recipe…</option>
                  {recipes.map((r) => (
                    <option key={r.recipe_id} value={r.recipe_id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </label>
              <div className="journal-two-column">
                <label className="field-label">
                  Glazed On
                  <input className="input" type="date" disabled={!!completingFiringId} value={glazedDate} onChange={(e) => setGlazedDate(e.target.value)} />
                </label>
                <label className="field-label">
                  Kiln Schedule
                  <select className="select" value={firingSchedule} onChange={(e) => setFiringSchedule(e.target.value)}>
                    <option>Standard / medium</option>
                    <option>Slow</option>
                    <option>Fast</option>
                    <option>Community Kiln</option>
                    <option>Custom / programmed</option>
                  </select>
                </label>
              </div>
              <label className="field-label file-field">
                Before Firing Photos
                <input
                  className="input"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => setBeforePhoto(Array.from(e.target.files ?? []))}
                />
              </label>
              <div className="journal-two-column">
                <label className="field-label">
                  Glaze Firing Cone
                  <select className="select" value={cone} onChange={(e) => setCone(+e.target.value)}>
                    <option value="0">N/A</option>
                    {[5, 6, 7, 8, 9, 10].map((value) => (
                      <option key={value} value={value}>Cone {value}</option>
                    ))}
                  </select>
                </label>
                <label className="field-label">
                  Bisque Firing Cone
                  <select className="select" value={bisqueCone} onChange={(e) => setBisqueCone(e.target.value)}>
                    <option value="">N/A</option>
                    <option value="010">Cone 010</option>
                    <option value="08">Cone 08</option>
                    <option value="06">Cone 06</option>
                    <option value="05">Cone 05</option>
                    <option value="04">Cone 04</option>
                  </select>
                </label>
              </div>
              <label className="field-label">
                Project Orientation
                <select className="select" value={firingOrientation} onChange={(e) => setFiringOrientation(e.target.value)}>
                  <option value="vertical">Vertical</option>
                  <option value="horizontal">Horizontal</option>
                  <option value="sculptural">Sculptural / mixed</option>
                </select>
              </label>
              <div className="journal-section-divider" />
              <span className="journal-step">2 · What happened</span>
              <label className="field-label">
                Fired On
                <input className="input" type="date" value={firingDate} onChange={(e) => setFiringDate(e.target.value)} />
              </label>
              <label className="field-label">
                Movement After Firing
                <textarea className="textarea" placeholder="Describe running, pooling, breaking, or movement" value={movement} onChange={(e) => setMovement(e.target.value)} />
              </label>
              <div className="journal-two-column">
                <label className="field-label">
                  Movement Distance
                  <input className="input" type="number" inputMode="decimal" min="0" step="0.5" placeholder="mm (optional)" value={travelDistance} onChange={(e) => setTravelDistance(e.target.value)} />
                </label>
                <label className="field-label">
                  Surface Result
                  <select className="select" value={surfaceResult} onChange={(e) => setSurfaceResult(e.target.value)}>
                    <option value="">Choose…</option>
                    <option>Glossy</option>
                    <option>Satin</option>
                    <option>Matte</option>
                    <option>Mixed / varied</option>
                    <option>Textured</option>
                  </select>
                </label>
              </div>
              <label className="field-label">
                Color Result
                <input className="input" placeholder="What colors developed after firing?" value={colorResult} onChange={(e) => setColorResult(e.target.value)} />
              </label>
              <label className="field-label">
                Defects or Surprises
                <input className="input" placeholder="None, pinholes, crawling, crazing…" value={defects} onChange={(e) => setDefects(e.target.value)} />
              </label>
              <label className="field-label">
                Result Rating
                <select className="select" value={rating} onChange={(e) => setRating(+e.target.value)}>
                  <option value="5">★★★★★ Excellent</option>
                  <option value="4">★★★★ Very good</option>
                  <option value="3">★★★ Good</option>
                  <option value="2">★★ Needs work</option>
                  <option value="1">★ Poor result</option>
                </select>
              </label>
              <label className="field-label">
                Learning Notes
                <textarea className="textarea" placeholder="What would you repeat or change next time?" value={firingNotes} onChange={(e) => setFiringNotes(e.target.value)} />
              </label>
              <div className="journal-section-divider" />
              <span className="journal-step">3 · After Firing Photos</span>
              <label className="field-label file-field">
                After Firing Photos
                <input
                  className="input"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => setPhoto(Array.from(e.target.files ?? []))}
                />
              </label>
              {completingFiringId && editingHadResult ? (
                <button className="btn primary journal-save" disabled={firingSaving} onClick={() => fire("complete")}>
                  {firingSaving ? "Saving…" : "Update Firing"}
                </button>
              ) : completingFiringId ? (
                <div className="journal-save-actions">
                  <button className="btn ghost" disabled={firingSaving} onClick={saveFiringUpdate}>
                    {firingSaving ? "Saving…" : "Save Update"}
                  </button>
                  <button className="btn primary journal-save" disabled={firingSaving} onClick={() => fire("complete")}>
                    {firingSaving ? "Saving…" : "Complete Firing"}
                  </button>
                </div>
              ) : (
                <div className="journal-save-actions">
                  <button className="btn ghost" disabled={firingSaving} onClick={() => fire("progress")}>
                    {firingSaving ? "Saving…" : "Save as In Progress"}
                  </button>
                  <button className="btn primary journal-save" disabled={firingSaving} onClick={() => fire("complete")}>
                    {firingSaving ? "Saving…" : "Save Firing Result"}
                  </button>
                </div>
              )}
              </div>
            </details>
            <div className="journal-history-heading">
              <strong>Firing History</strong>
              <span>{firings.length} saved</span>
            </div>
            {firings.length === 0 && (
              <div className="card journal-empty">
                <strong>Your first firing result will appear here.</strong>
                <p className="muted">Choose a saved recipe above, then record what happened in the kiln.</p>
              </div>
            )}
            {firings.map((f) => (
              <details className="item firing-card" key={f.firing_id}>
                <summary className="firing-card-summary">
                  <div>
                    <strong>{f.recipe_name}</strong>
                    <div className="muted">
                      {f.fired_at
                        ? new Date(f.fired_at).toLocaleDateString()
                        : f.glazed_at
                          ? "Glazed " + new Date(f.glazed_at + "T12:00:00").toLocaleDateString()
                          : "Date not recorded"}
                      {f.cone != null ? ` • Cone ${f.cone}` : ""}
                    </div>
                  </div>
                  {f.fired_at ? (
                    <span className="firing-rating">{f.rating || "—"}/5</span>
                  ) : (
                    <span className="firing-in-progress">In Progress</span>
                  )}
                </summary>
                {f.fired_at ? (
                  <>
                    <div className="firing-card-badges">
                      <span>E{f.evidence_tier} evidence</span>
                      {f.photo_count > 0 && <span>{f.photo_count} {Number(f.photo_count) === 1 ? "photo" : "photos"}</span>}
                      {f.prediction_movement_risk != null && <span>Predicted risk {f.prediction_movement_risk}/10</span>}
                      {f.shared && <span className="is-shared">Shared in Explore</span>}
                    </div>
                    {f.movement_result && <p>{f.movement_result}</p>}
                    <div className="firing-card-actions">
                      <button className="btn secondary firing-detail-button" onClick={() => openFiringDetail(f.firing_id)}>
                        Compare Prediction &amp; Result <ArrowRight size={16} />
                      </button>
                      <button className="btn ghost firing-detail-button" onClick={() => startEditingFiring(f)}>
                        Edit This Firing
                      </button>
                      <button
                        className={"btn firing-share-button " + (f.shared ? "is-shared" : "ghost")}
                        disabled={sharingFiringId === f.firing_id || (!f.shared && Number(f.photo_count) < 1)}
                        title={!f.shared && Number(f.photo_count) < 1 ? "Add a photo before sharing" : ""}
                        onClick={() => toggleFiringShare(f.firing_id, !f.shared, Number(f.photo_count))}
                      >
                        <Share2 size={16} />
                        {sharingFiringId === f.firing_id
                          ? "Updating…"
                          : f.shared
                            ? "Remove from Explore"
                            : Number(f.photo_count) < 1
                              ? "Add photo to share"
                              : "Share in Explore"}
                      </button>
                    </div>
                    <button className="btn delete-btn" onClick={() => deleteFiring(f.firing_id, f.recipe_name)}>
                      Delete Firing
                    </button>
                  </>
                ) : (
                  <>
                    <button className="btn primary firing-detail-button" onClick={() => startEditingFiring(f)}>
                      Update or Complete This Firing <ArrowRight size={16} />
                    </button>
                    <button className="btn delete-btn" onClick={() => deleteFiring(f.firing_id, f.recipe_name)}>
                      Delete Firing
                    </button>
                  </>
                )}
              </details>
            ))}
          </>
        )}
        {firingDetail && typeof document !== "undefined" && createPortal(
          <div className="overlay firing-detail-overlay" onClick={() => setFiringDetail(null)}>
            <section
              className="firing-detail-sheet"
              role="dialog"
              aria-modal="true"
              aria-label="Firing result details"
              onClick={(e) => e.stopPropagation()}
            >
              {firingDetailLoading ? (
                <div className="detail-loading">Loading firing details…</div>
              ) : (
                <>
                  <div className="row firing-detail-heading">
                    <div>
                      <span className="eyebrow">FIRING RESULT</span>
                      <h2>{firingDetail.recipe_name}</h2>
                      <p>
                        {firingDetail.fired_at
                          ? new Date(firingDetail.fired_at).toLocaleDateString()
                          : "Date not recorded"}
                        {firingDetail.fired_cone != null
                          ? ` • Cone ${firingDetail.fired_cone}`
                          : ""}
                      </p>
                    </div>
                    <button className="close" aria-label="Close firing details" onClick={() => setFiringDetail(null)}>×</button>
                  </div>
                  <div className="firing-detail-meta">
                    {firingDetail.schedule && <span>{firingDetail.schedule}</span>}
                    {firingDetail.orientation && <span>{titleCase(firingDetail.orientation)}</span>}
                    <span>{firingDetail.rating || "—"}/5 rating</span>
                  </div>
                  <section className="comparison-section">
                    <span className="eyebrow">PREDICTION VS. RESULT</span>
                    {!firingDetail.prediction_verdict && (
                      <p className="legacy-prediction-note">
                        This older recipe did not save a prediction snapshot. Its firing result is still preserved below.
                      </p>
                    )}
                    <div className="comparison-grid">
                      <div className="comparison-label">Movement</div>
                      <div className="comparison-predicted">
                        <small>Predicted</small>
                        <strong>
                          {firingDetail.prediction_movement_risk != null
                            ? `${firingDetail.prediction_movement_risk}/10 risk`
                            : "Not saved"}
                        </strong>
                        {firingDetail.prediction_verdict && <span>{firingDetail.prediction_verdict}</span>}
                      </div>
                      <div className="comparison-actual">
                        <small>Actual</small>
                        <strong>{firingDetail.movement_result || "No movement note"}</strong>
                        {firingDetail.travel_mm != null && <span>{firingDetail.travel_mm} mm traveled</span>}
                      </div>
                      <div className="comparison-label">Appearance</div>
                      <div className="comparison-predicted">
                        <small>Predicted</small>
                        <strong>{firingDetail.prediction_effect_match || "Not saved"}</strong>
                      </div>
                      <div className="comparison-actual">
                        <small>Actual</small>
                        <strong>{firingDetail.color_result || "No color note"}</strong>
                        {firingDetail.surface_result && <span>{firingDetail.surface_result} surface</span>}
                      </div>
                      <div className="comparison-label">Warnings</div>
                      <div className="comparison-predicted">
                        <small>Before firing</small>
                        {Array.isArray(firingDetail.prediction_warnings) && firingDetail.prediction_warnings.length > 0 ? (
                          <ul>
                            {firingDetail.prediction_warnings.map((warning: string, i: number) => <li key={i}>{warning}</li>)}
                          </ul>
                        ) : <strong>None saved</strong>}
                      </div>
                      <div className="comparison-actual">
                        <small>After firing</small>
                        <strong>{firingDetail.defects || "No defects recorded"}</strong>
                      </div>
                      <div className="comparison-label">Cone</div>
                      <div className="comparison-predicted">
                        <small>Predicted</small>
                        <strong>{firingDetail.prediction_compatibility || `Recipe cone ${firingDetail.recipe_cone || "—"}`}</strong>
                      </div>
                      <div className="comparison-actual">
                        <small>Actual</small>
                        <strong>Cone {firingDetail.fired_cone || "—"}</strong>
                      </div>
                    </div>
                  </section>
                  {Array.isArray(firingDetail.layers) && firingDetail.layers.length > 0 && (
                    <section className="firing-layers-section">
                      <span className="eyebrow">RECIPE STACK</span>
                      {firingDetail.layers.map((layer: any, i: number) => {
                        const application = decodeApplication(layer.placement);
                        return (
                          <div className="firing-layer-row" key={layer.glaze_id + i}>
                            <span className="layer-number">{i + 1}</span>
                            <div>
                              <strong>{layer.glaze_name}</strong>
                              <small>{layer.manufacturer}</small>
                            </div>
                            <div>
                              <strong>{layer.coats || "—"} coats</strong>
                              <small>{titleCase(application.surface)} · {titleCase(application.placement)}</small>
                            </div>
                          </div>
                        );
                      })}
                    </section>
                  )}
                  {(firingDetail.notes || firingDetail.prediction_rationale) && (
                    <section className="firing-learning-section">
                      <span className="eyebrow">WHAT TO CARRY FORWARD</span>
                      {firingDetail.notes && <p><strong>Your notes:</strong> {firingDetail.notes}</p>}
                      {firingDetail.prediction_rationale && <p><strong>Original rationale:</strong> {firingDetail.prediction_rationale}</p>}
                    </section>
                  )}
                  {firingDetailPhotos.length > 0 && (
                    <section className="firing-photo-section">
                      <span className="eyebrow">PHOTOS</span>
                      <div className="firing-photo-grid">
                        {firingDetailPhotos.map((item) => (
                          <figure key={item.photo_id}>
                            <img src={item.signedUrl} alt={`${item.photo_type} firing`} />
                            <figcaption>{titleCase(item.photo_type)}</figcaption>
                          </figure>
                        ))}
                      </div>
                    </section>
                  )}
                  {firingDetail.shared && (
                    <section className="firing-comments-section">
                      <span className="eyebrow">COMMENTS</span>
                      {firingComments.length === 0 && (
                        <p className="muted">No comments yet — be the first to say something.</p>
                      )}
                      {firingComments.map((c) => (
                        <div className="firing-comment" key={c.comment_id}>
                          <div className="firing-comment-heading">
                            <strong>{c.display_name}</strong>
                            <span>{new Date(c.created_at).toLocaleDateString()}</span>
                          </div>
                          <p>{c.comment}</p>
                          {c.is_mine && (
                            <button
                              className="firing-comment-delete"
                              onClick={() => deleteFiringComment(c.comment_id)}
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      ))}
                      <div className="firing-comment-form">
                        <textarea
                          className="textarea"
                          placeholder="Share a thought about this firing…"
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          maxLength={1000}
                        />
                        <button
                          className="btn primary"
                          disabled={commentPosting || !newComment.trim()}
                          onClick={postFiringComment}
                        >
                          {commentPosting ? "Posting…" : "Post Comment"}
                        </button>
                      </div>
                    </section>
                  )}
                  <button className="btn ghost firing-detail-close" onClick={() => setFiringDetail(null)}>Back to Journal</button>
                </>
              )}
            </section>
          </div>,
          document.body,
        )}
        {inventoryItem && typeof document !== "undefined" && createPortal(
          <div className="overlay inventory-overlay" onClick={() => setInventoryItem(null)}>
            <section
              className="inventory-sheet"
              role="dialog"
              aria-modal="true"
              aria-label={`Edit ${inventoryItem.item_name || inventoryItem.glaze_name || "inventory"}`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="row inventory-heading">
                <div>
                  <span className="eyebrow">
                    {inventoryLocation === "mine" ? "MY INVENTORY" : "STUDIO INVENTORY"}
                  </span>
                  <h2>{inventoryItem.item_name || inventoryItem.glaze_name || inventoryItem.clay_name}</h2>
                  <p>{inventoryItem.manufacturer}</p>
                </div>
                <button className="close" aria-label="Close inventory editor" onClick={() => setInventoryItem(null)}>
                  ×
                </button>
              </div>
              {msg && <div className="notice inventory-notice" role="status">{msg}</div>}
              <div className="inventory-form">
                <label className="field-label">
                  Status
                  <select className="select" value={inventoryStatus} onChange={(e) => setInventoryStatus(e.target.value)}>
                    {inventoryLocation === "mine" ? (
                      <>
                        <option value="owned">On My Shelf</option>
                        <option value="low">Low Stock</option>
                        {resultItemType(inventoryItem) === "glaze" && <option value="wishlist">Want to Try</option>}
                        <option value="archived">Archived</option>
                      </>
                    ) : (
                      <>
                        <option value="available">Available</option>
                        <option value="low">Low Stock</option>
                        <option value="unavailable">Unavailable</option>
                        <option value="archived">Archived</option>
                      </>
                    )}
                  </select>
                </label>
                <div className="inventory-form-grid">
                  <label className="field-label">
                    Quantity
                    <input
                      className="input"
                      type="number"
                      min="0"
                      step="0.25"
                      inputMode="decimal"
                      placeholder="e.g., 1.5"
                      value={inventoryQuantity}
                      onChange={(e) => setInventoryQuantity(e.target.value)}
                    />
                  </label>
                  <label className="field-label">
                    Container Size
                    <input
                      className="input"
                      placeholder="e.g., Pint or 16 oz"
                      value={inventoryContainer}
                      onChange={(e) => setInventoryContainer(e.target.value)}
                    />
                  </label>
                </div>
                <label className="field-label">
                  Notes
                  <textarea
                    className="textarea"
                    placeholder="Where it is stored, reorder note, test result…"
                    value={inventoryNotes}
                    onChange={(e) => setInventoryNotes(e.target.value)}
                  />
                </label>
              </div>
              <div className="grid inventory-sheet-actions">
                <button className="btn secondary" onClick={() => setInventoryItem(null)}>Cancel</button>
                <button className="btn primary" disabled={inventorySaving} onClick={saveInventory}>
                  {inventorySaving ? "Saving…" : "Save Inventory"}
                </button>
              </div>
            </section>
          </div>,
          document.body,
        )}
        {cropSrc && typeof document !== "undefined" && createPortal(
          <div className="overlay crop-overlay" onClick={cancelCrop}>
            <div className="crop-sheet" onClick={(e) => e.stopPropagation()}>
              <h2>{cropTarget === "studio" ? "Adjust Studio Photo" : "Adjust Your Photo"}</h2>
              <p className="muted">Drag to reposition, use the slider to zoom.</p>
              <div
                className="crop-viewport"
                onPointerDown={onCropPointerDown}
                onPointerMove={onCropPointerMove}
                onPointerUp={onCropPointerUp}
                onPointerCancel={onCropPointerUp}
              >
                <img
                  src={cropSrc}
                  alt=""
                  draggable={false}
                  onLoad={(e) => {
                    const img = e.currentTarget;
                    setCropNatural({
                      w: img.naturalWidth,
                      h: img.naturalHeight,
                    });
                  }}
                  style={
                    cropNatural.w
                      ? {
                          width:
                            cropNatural.w *
                            Math.max(280 / cropNatural.w, 280 / cropNatural.h) *
                            cropZoom,
                          height:
                            cropNatural.h *
                            Math.max(280 / cropNatural.w, 280 / cropNatural.h) *
                            cropZoom,
                          transform: `translate(calc(-50% + ${cropOffset.x}px), calc(-50% + ${cropOffset.y}px))`,
                        }
                      : { opacity: 0 }
                  }
                />
              </div>
              <label className="field-label crop-zoom-label">
                Zoom
                <input
                  type="range"
                  min="1"
                  max="3"
                  step="0.01"
                  value={cropZoom}
                  onChange={(e) => onCropZoomChange(Number(e.target.value))}
                />
              </label>
              <div className="crop-actions">
                <button className="btn ghost" onClick={cancelCrop}>
                  Cancel
                </button>
                <button className="btn primary" onClick={confirmCrop}>
                  Use Photo
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
        {materialDetail && typeof document !== "undefined" && createPortal(
          <div className="overlay" onClick={closeMaterialDetail}>
            <div
              className="glaze-detail-sheet"
              role="dialog"
              aria-modal="true"
              aria-label={`${materialDetail.name || materialDetail.item_name} underglaze details`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="row detail-heading">
                <div>
                  <span className="eyebrow">UNDERGLAZE DETAILS</span>
                  <h2>{materialDetail.name || materialDetail.item_name}</h2>
                  <p>
                    {typeof materialDetail.manufacturer === "string"
                      ? materialDetail.manufacturer
                      : materialManufacturer(materialDetail)}
                    {displayMaterialSku(materialDetail.sku || materialDetail.sku_or_code)
                      ? ` • ${displayMaterialSku(materialDetail.sku || materialDetail.sku_or_code)}`
                      : ""}
                  </p>
                </div>
                <button className="close" aria-label="Close underglaze details" onClick={closeMaterialDetail}>×</button>
              </div>
              <div className="detail-chips">
                <span>{materialDetail.firing_range || "Range needs review"}</span>
                <span>{materialDetail.opacity || "Opacity needs review"}</span>
                <span>Underglaze</span>
              </div>
              <section className="detail-section">
                <span className="eyebrow">USE &amp; APPEARANCE</span>
                <div className="detail-grid">
                  <div><span>Finish</span><strong>{materialDetail.finish || "Not yet recorded"}</strong></div>
                  <div><span>Opacity</span><strong>{materialDetail.opacity || "Not yet recorded"}</strong></div>
                  <div><span>Mixable / layerable</span><strong>{materialDetail.mixable_layerable || "Not yet recorded"}</strong></div>
                  <div><span>Movement</span><strong>{materialDetail.movement_behavior || "Stable decorative material"}</strong></div>
                </div>
              </section>
              {materialDetail.primary_uses && (
                <section className="detail-copy">
                  <span className="eyebrow">PRIMARY USES</span>
                  <p>{materialDetail.primary_uses}</p>
                </section>
              )}
              <section className="food-safety-card caution">
                <div className="food-safety-title">
                  <ShieldCheck size={23} />
                  <div><span className="eyebrow">FOOD &amp; DINNERWARE</span><strong>Follow the complete fired-surface guidance</strong></div>
                </div>
                {materialDetail.food_safe_claim && <p>{materialDetail.food_safe_claim}</p>}
                {materialDetail.food_contact_note && <p className="restriction-note">{materialDetail.food_contact_note}</p>}
              </section>
              <section className="detail-copy pairing-copy">
                <span className="eyebrow">BUILDER BOUNDARY</span>
                <p>Underglazes are tracked as decorative materials and are not included in glaze movement or layering predictions.</p>
              </section>
              <div className="detail-verification">
                <span>{materialDetail.confidence || "Manufacturer source recorded"}</span>
                {materialDetail.last_verified && <span>Verified {materialDetail.last_verified}</span>}
              </div>
              <div className="stack detail-actions">
                {materialDetail.source_url && (
                  <a className="btn primary" href={materialDetail.source_url} target="_blank" rel="noreferrer">
                    View Official Source
                  </a>
                )}
                <button className="btn ghost" onClick={closeMaterialDetail}>
                  Back to {tab === "find" ? "Finder" : "My Shelf"}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
        {glazeDetail && typeof document !== "undefined" && createPortal(
          <div className="overlay" onClick={closeGlazeDetail}>
            <div
              className="glaze-detail-sheet"
              role="dialog"
              aria-modal="true"
              aria-label={`${glazeDetail.name} glaze details`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="row detail-heading">
                <div>
                  <span className="eyebrow">GLAZE DETAILS</span>
                  <h2>{glazeDetail.name}</h2>
                  <p>
                    {detailManufacturer}
                    {glazeDetail.sku ? ` • ${glazeDetail.sku}` : ""}
                  </p>
                </div>
                <button
                  className="close"
                  aria-label="Close glaze details"
                  onClick={closeGlazeDetail}
                >
                  ×
                </button>
              </div>
              {glazeDetailLoading ? (
                <div className="detail-loading">Loading glaze details…</div>
              ) : (
                <>
                  <div className="detail-chips">
                    <span>{detailCone}</span>
                    <span>{detailIntel?.our_type || "Type needs review"}</span>
                    {detailIntel?.color_family && (
                      <span>{detailIntel.color_family}</span>
                    )}
                  </div>
                  <section className={`food-safety-card ${detailFoodClass}`}>
                    <div className="food-safety-title">
                      <ShieldCheck size={23} />
                      <div>
                        <span className="eyebrow">FOOD &amp; DINNERWARE</span>
                        <strong>{detailFoodContact}</strong>
                      </div>
                    </div>
                    <div className="detail-row">
                      <span>Food-safe chemistry</span>
                      <strong>{detailFoodChemistry}</strong>
                    </div>
                    <div className="detail-row">
                      <span>Food-contact surface</span>
                      <strong>{detailFoodContact}</strong>
                    </div>
                    {detailIntel?.food_contact_restriction_reason && (
                      <p className="restriction-note">
                        {detailIntel.food_contact_restriction_reason}
                      </p>
                    )}
                    <p className="safety-note">
                      Always follow the manufacturer’s current label.
                      Food-contact safety also depends on correct firing and an
                      intact, stable glaze surface.
                    </p>
                  </section>
                  <section className="detail-section">
                    <span className="eyebrow">APPEARANCE &amp; BEHAVIOR</span>
                    <div className="detail-grid">
                      <div>
                        <span>Finish</span>
                        <strong>
                          {glazeDetail.finish || "Not yet recorded"}
                        </strong>
                      </div>
                      <div>
                        <span>Opacity</span>
                        <strong>
                          {glazeDetail.opacity || "Not yet recorded"}
                        </strong>
                      </div>
                      <div>
                        <span>Layer role</span>
                        <strong>
                          {detailIntel?.layer_role || "Not yet recorded"}
                        </strong>
                      </div>
                      <div>
                        <span>Movement risk</span>
                        <strong>
                          {detailIntel?.run_risk != null
                            ? `${detailIntel.run_risk}/5`
                            : glazeDetail.movement_score != null
                              ? `${glazeDetail.movement_score}/5`
                              : "Not yet recorded"}
                        </strong>
                      </div>
                      <div>
                        <span>Layer reactivity</span>
                        <strong>
                          {detailIntel?.layer_reactivity != null
                            ? `${detailIntel.layer_reactivity}/5`
                            : "Not yet recorded"}
                        </strong>
                      </div>
                      <div>
                        <span>Breaks on texture</span>
                        <strong>
                          {detailIntel?.breaks_over_texture != null
                            ? `${detailIntel.breaks_over_texture}/5`
                            : "Not yet recorded"}
                        </strong>
                      </div>
                    </div>
                  </section>
                  {(detailIntel?.manufacturer_description ||
                    glazeDetail.notes) && (
                    <section className="detail-copy">
                      <span className="eyebrow">ABOUT THIS GLAZE</span>
                      <p>
                        {detailIntel?.manufacturer_description ||
                          glazeDetail.notes}
                      </p>
                    </section>
                  )}
                  {detailIntel?.best_pairings && (
                    <section className="detail-copy pairing-copy">
                      <span className="eyebrow">PAIRING NOTES</span>
                      <p>{detailIntel.best_pairings}</p>
                    </section>
                  )}
                  <div className="detail-verification">
                    <span>
                      {detailIntel?.confidence || "Details awaiting review"}
                    </span>
                    {detailIntel?.last_verified && (
                      <span>Verified {detailIntel.last_verified}</span>
                    )}
                  </div>
                  <div className="stack detail-actions">
                    <button
                      className="btn primary"
                      onClick={() => addShelfGlazeToBuild(glazeDetail)}
                    >
                      Add to Build
                    </button>
                    <button
                      className="btn ghost"
                      onClick={closeGlazeDetail}
                    >
                      Back to {tab === "find" ? "Finder" : "My Shelf"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>,
          document.body,
        )}
        {recipeDetail.length > 0 && typeof document !== "undefined" && createPortal(
          <div className="overlay" onClick={() => setRecipeDetail([])}>
            <div className="recipe-sheet" onClick={(e) => e.stopPropagation()}>
              <div className="row">
                <div>
                  <span className="eyebrow">SAVED RECIPE</span>
                  <h2>{recipeDetail[0].recipe_name}</h2>
                </div>
                <button
                  className="close"
                  aria-label="Close recipe"
                  onClick={() => setRecipeDetail([])}
                >
                  ×
                </button>
              </div>
              <div className="recipe-meta">
                <span>{recipeDetail[0].clay_name || "No clay selected"}</span>
                <span>Cone {recipeDetail[0].cone}</span>
                <span>{recipeDetail[0].texture || "No texture"}</span>
              </div>
              {recipeDetail[0].form && recipeDetail[0].form !== "vertical" && (
                <div className="project-summary">
                  <span className="eyebrow">PROJECT</span>
                  <p>{recipeDetail[0].form}</p>
                </div>
              )}
              {recipeDetail[0].goal && (
                <div className="goal">
                  <span className="eyebrow">DESIRED EFFECT</span>
                  <p>{recipeDetail[0].goal}</p>
                </div>
              )}
              {recipeDetail[0].prediction_verdict ? (
                <section className="saved-prediction-card">
                  <div className="row">
                    <div>
                      <span className="eyebrow">SAVED PREDICTION</span>
                      <strong>{recipeDetail[0].prediction_verdict}</strong>
                    </div>
                    {recipeDetail[0].prediction_movement_risk != null && (
                      <span className="prediction-risk">
                        Risk {recipeDetail[0].prediction_movement_risk}/10
                      </span>
                    )}
                  </div>
                  <div className="saved-prediction-grid">
                    {recipeDetail[0].prediction_effect_match && (
                      <div><span>Effect</span><strong>{recipeDetail[0].prediction_effect_match}</strong></div>
                    )}
                    {recipeDetail[0].prediction_compatibility && (
                      <div><span>Cone</span><strong>{recipeDetail[0].prediction_compatibility}</strong></div>
                    )}
                    {recipeDetail[0].prediction_food_guidance && (
                      <div><span>Food contact</span><strong>{recipeDetail[0].prediction_food_guidance}</strong></div>
                    )}
                    {recipeDetail[0].prediction_clay_influence && (
                      <div><span>Clay</span><strong>{recipeDetail[0].prediction_clay_influence}</strong></div>
                    )}
                  </div>
                  {Array.isArray(recipeDetail[0].prediction_warnings) && recipeDetail[0].prediction_warnings.length > 0 && (
                    <div className="saved-prediction-warnings">
                      <strong>Before you fire</strong>
                      <ul>
                        {recipeDetail[0].prediction_warnings.map((warning: string, i: number) => <li key={i}>{warning}</li>)}
                      </ul>
                    </div>
                  )}
                </section>
              ) : (
                <p className="legacy-prediction-note">
                  Prediction details were not stored when this older recipe was saved.
                </p>
              )}
              <div className="recipe-layers">
                {recipeDetail.map((x, i) => {
                  const application = decodeApplication(x.placement);
                  return (
                    <div className="recipe-layer" key={x.glaze_id + i}>
                      <span className="layer-number">{i + 1}</span>
                      <div>
                        <span className="muted">
                          {i === 0 ? "Base glaze" : `Layer ${i + 1}`}
                        </span>
                        <strong>{x.glaze_name}</strong>
                        <span className="muted">{x.manufacturer}</span>
                      </div>
                      <div className="layer-detail">
                        <strong>{x.coats || "—"}</strong>
                        <span className="muted">coats</span>
                        <span>{titleCase(application.surface)}</span>
                        <span className="muted">
                          {titleCase(application.placement)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="stack">
                <button
                  className="btn primary"
                  onClick={() =>
                    startFiring(recipeDetail[0].recipe_id, recipeDetail[0].cone)
                  }
                >
                  Start Firing Log
                </button>
                <button className="btn ghost" onClick={editRecipe}>
                  Edit Recipe in Builder
                </button>
                <button
                  className="btn delete-btn"
                  onClick={() =>
                    deleteRecipe(
                      recipeDetail[0].recipe_id,
                      recipeDetail[0].recipe_name,
                    )
                  }
                >
                  Delete Recipe
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
        {studioRecipesOpen && typeof document !== "undefined" && createPortal(
          <div className="overlay" onClick={() => setStudioRecipesOpen(false)}>
            <div className="recipe-sheet" onClick={(e) => e.stopPropagation()}>
              <div className="row recipe-card-heading">
                <h2>{currentStudio?.name}'s Shared Recipes</h2>
                <button className="close" aria-label="Close" onClick={() => setStudioRecipesOpen(false)}>×</button>
              </div>
              {studioRecipesLoading && <p className="muted">Loading…</p>}
              {!studioRecipesLoading && studioRecipesList.length === 0 && (
                <p className="muted">
                  No one has shared a recipe with this studio yet. Share one of yours from the Recipes tab.
                </p>
              )}
              {studioRecipesList.map((r) => (
                <div className="item recipe-card" key={r.recipe_id}>
                  <div className="row recipe-card-heading">
                    <div>
                      <strong>{r.name}</strong>
                      <div className="muted">
                        {r.clay_name || "No clay selected"} • Cone {r.cone}
                      </div>
                    </div>
                    {r.is_mine && <span className="tag">Yours</span>}
                  </div>
                  <div className="muted" style={{ marginBottom: 8 }}>
                    Shared by {r.creator_display_name}
                  </div>
                  {Array.isArray(r.layers) && r.layers.length > 0 && (
                    <div className="explore-layer-list">
                      {r.layers.map((layer: any, index: number) => (
                        <span key={index}>
                          {layer.glaze_name}{layer.coats ? " · " + layer.coats + " coats" : ""}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>,
          document.body,
        )}
        {msg && tab !== "find" && tab !== "account" && (
          <div className="notice">{msg}</div>
        )}
        <BottomNavigation
          activeScreen={tab}
          onNavigate={(screen) =>
            screen === "find"
              ? openFinder("all")
              : (setMsg(""),
                screen === "journal" && setJournalFormOpen(false),
                setTab(screen))
          }
        />
      </main>
    </>
  );
}
