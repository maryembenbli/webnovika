import { NavLink, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import { useLocale } from '../context/locale.context';

export function AppShell({ children, searchValue = '', onSearchChange, title, subtitle }) {
  const navigate = useNavigate();
  const { locale, setLocale, t } = useLocale();

  return (
    <div className='shopShell'>
      <header className='topbar'>
        <div className='topbarInner'>
          <button className='brand' type='button' onClick={() => navigate('/')}>
            <div className='brandLogo brandLogoImage'>
              <img src={logo} alt={title || t('brandName')} />
            </div>
            <div className='brandText'>
              <div className='brandName'>{title || t('brandName')}</div>
              <div className='brandTag'>{subtitle || t('brandTag')}</div>
            </div>
          </button>

          <div className='searchWrap'>
            <input
              value={searchValue}
              onChange={(event) => onSearchChange?.(event.target.value)}
              placeholder={t('searchPlaceholder')}
              className='searchInput'
            />
            <div className='searchIcon'>?</div>
          </div>

          <div className='headerTools'>
            <div className='langCompact' aria-label={t('navLanguage')}>
              <button
                type='button'
                className={`langCompactBtn ${locale === 'fr' ? 'active' : ''}`}
                onClick={() => setLocale('fr')}
              >
                FR
              </button>
              <button
                type='button'
                className={`langCompactBtn ${locale === 'ar' ? 'active' : ''}`}
                onClick={() => setLocale('ar')}
              >
                AR
              </button>
            </div>

            <nav className='actions actionsNav'>
              <NavLink to='/' className={({ isActive }) => `navLink ${isActive ? 'active' : ''}`}>
                {t('navShop')}
              </NavLink>
              <NavLink
                to='/cart'
                className={({ isActive }) => `navLink navLinkAccent ${isActive ? 'active' : ''}`}
              >
                {t('navOrders')}
              </NavLink>
            </nav>
          </div>
        </div>
      </header>

      {children}
    </div>
  );
}
