// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ThemeProps } from '@subwallet/extension-web-ui/types';
import { Button, Icon, Input } from '@subwallet/react-ui';
import CN from 'classnames';
import { DownloadSimple, MagnifyingGlass } from 'phosphor-react';
import React, { ChangeEventHandler, useCallback, useMemo } from 'react';
import styled from 'styled-components';

type Props = ThemeProps & {
  placeholder: string
  className?: string
  searchValue: string,
  onSearch: (value: string) => void;
  onClickActionBtn?: () => void;
  actionBtnIcon?: JSX.Element;
  showActionBtn?: boolean;
  extraButton?: JSX.Element
  showExtraButton?: boolean;
  autoFocus?: boolean;
  simpleLayout?: boolean;
}

const Component: React.FC<Props> = ({ actionBtnIcon, autoFocus,
  className,
  extraButton,
  onClickActionBtn,
  onSearch,
  placeholder,
  searchValue,
  showActionBtn,
  showExtraButton = false, simpleLayout }) => {
  // CONTROLLED STATE
  // const [value, setValue] = useState<string>(searchValue)

  // const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = useCallback((e) => {
  //   if (e.key === 'Enter' && value) {
  //     onSearch(value)
  //   }
  // }, [value])

  // const handleInputChange: ChangeEventHandler<HTMLInputElement> = (e) => {
  //   const value = e?.target?.value;
  //   setValue(value)
  // }

  // UNCONTROLLED STATE
  const handleInputChange: ChangeEventHandler<HTMLInputElement> = useCallback((e) => {
    const value = e?.target?.value;

    onSearch(value);
  },
  [onSearch]
  );

  const button = useMemo(() => extraButton || (
    <Button
      icon={<Icon
        phosphorIcon={DownloadSimple}
        size='sm'
      />}
      type='ghost'
    />
  ), [extraButton]);

  if (simpleLayout) {
    return (
      <div className={CN(className)}>
        <Input.Search
          autoFocus={autoFocus}
          className='__search-input'
          onChange={handleInputChange}
          placeholder={placeholder}
          prefix={<Icon phosphorIcon={MagnifyingGlass} />}
          size='md'
          suffix={
            showActionBtn && (
              <Button
                icon={actionBtnIcon}
                onClick={onClickActionBtn}
                size='xs'
                type='ghost'
              />
            )
          }
          value={searchValue}
        />
      </div>
    );
  }

  return (
    <div className={CN('search-container', className)}>
      <div className='right-section'>
        {showExtraButton && button}
        <Input.Search
          autoFocus={autoFocus}
          className='search-input'
          onChange={handleInputChange}
          placeholder={placeholder}
          prefix={<Icon phosphorIcon={MagnifyingGlass} />}
          size='md'
          suffix={
            showActionBtn && (
              <Button
                icon={actionBtnIcon}
                onClick={onClickActionBtn}
                size='xs'
                type='ghost'
              />
            )
          }
          value={searchValue}
          // onKeyDown={handleKeyDown}
        />
      </div>
    </div>
  );
};

const Search = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {
    '&.search-container': {
      display: 'grid',
      width: '100%'
    },

    '.right-section': {
      justifySelf: 'end',
      display: 'flex',
      alignItems: 'center',
      gap: token.sizeXS,
      width: '100%'
    },

    '.search-input': {
      width: '100%',
      height: 48
    }
  };
});

export default Search;
